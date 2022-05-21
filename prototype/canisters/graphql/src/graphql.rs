mod queries {
    pub mod create_invoice;
    pub mod create_question;
    pub mod create_answer;
    pub mod create_dispute;
    pub mod get_answer;
    pub mod get_invoice;
    pub mod get_question_answers;
    pub mod get_question;
    pub mod set_winner;
    pub mod set_winner_invoice;
}

use sudograph::graphql_database;

use ic_cdk::export::{candid::{CandidType}, Principal};

use serde_json::{Value};

graphql_database!("canisters/graphql/src/schema.graphql");

#[derive(ic_cdk::export::candid::CandidType, serde::Deserialize, Debug, Clone)]
enum QuestionStatusEnum {
    CREATED,
    OPEN,
    PICKANSWER,
    DISPUTABLE,
    DISPUTED,
    CLOSED
}

#[derive(ic_cdk::export::candid::CandidType, serde::Deserialize, Debug, Clone)]
struct InvoiceType {
    id: String,
    buyer: String
}

#[derive(ic_cdk::export::candid::CandidType, serde::Deserialize, Debug, Clone)]
struct QuestionType {
    id: String,
    author: String,
    author_invoice: InvoiceType,
    creation_date: i32,
    status: QuestionStatusEnum,
    status_update_date: i32,
    content: String,
    reward: i32,
    dispute: Option<DisputeType>,
    winner: Option<AnswerType>,
    winner_invoice: Option<InvoiceType>
}

#[derive(ic_cdk::export::candid::CandidType, serde::Deserialize, Debug, Clone)]
struct AnswerType {
    id: String,
    author: String,
    creation_date: i32,
    content: String
}

#[derive(ic_cdk::export::candid::CandidType, serde::Deserialize, Debug, Clone)]
struct DisputeType {
    id: String,
    creation_date: i32
}

impl std::fmt::Display for QuestionStatusEnum {
    fn fmt(&self, f: &mut std::fmt::Formatter<'_>) -> std::fmt::Result {
       match *self {
            QuestionStatusEnum::CREATED => write!(f, "CREATED"),
            QuestionStatusEnum::OPEN => write!(f, "OPEN"),
            QuestionStatusEnum::PICKANSWER => write!(f, "PICKANSWER"),
            QuestionStatusEnum::DISPUTABLE => write!(f, "DISPUTABLE"),
            QuestionStatusEnum::DISPUTED => write!(f, "DISPUTED"),
            QuestionStatusEnum::CLOSED => write!(f, "CLOSED"),
       }
    }
 }

#[update]
async fn create_invoice(id: String, buyer: String) -> Option<InvoiceType> {
    // @todo: seems to have a bug, test in motoko
    let json_str = graphql_query(
        queries::create_invoice::macros::mutation!().to_string(),
        format!(
            queries::create_invoice::macros::args!(),
            id,
            buyer)).await;
    let json_data : Value = serde_json::from_str(&json_str).unwrap();
    let json_response = json_data["data"][queries::create_invoice::macros::response!()].as_array();
    if json_response != None {
        let vec_values = json_response.unwrap();
        if vec_values.len() == 1 {
            return Some(serde_json::from_value(vec_values[0].clone()).unwrap());
        }
    }
    return None;
}

#[update]
async fn create_question(
    author: String, 
    invoice_id: String, 
    creation_date: i32,
    status: QuestionStatusEnum, 
    status_update_date: i32, 
    content: String, 
    reward: i32) -> Option<QuestionType> {
    let json_str = graphql_query(
        queries::create_question::macros::mutation!().to_string(),
        format!(
            queries::create_question::macros::args!(),
            author,
            invoice_id,
            creation_date,
            status,
            status_update_date,
            content,
            reward)).await;
    let json_data : Value = serde_json::from_str(&json_str).unwrap();
    let json_response = json_data["data"][queries::create_question::macros::response!()].as_array();
    if json_response != None {
        let vec_values = json_response.unwrap();
        if vec_values.len() == 1 {
            return Some(serde_json::from_value(vec_values[0].clone()).unwrap());
        }
    }
    return None;
}

#[update]
async fn create_answer(
    question_id: String,
    author: String,
    creation_date: i32,
    content: String) -> Option<AnswerType> {
    let json_str = graphql_query(
        queries::create_answer::macros::mutation!().to_string(),
        format!(
            queries::create_answer::macros::args!(), 
            question_id,
            author,
            creation_date,
            content)).await;
    let json_data : Value = serde_json::from_str(&json_str).unwrap();
    let json_response = json_data["data"][queries::create_answer::macros::response!()].as_array();
    if json_response != None {
        let vec_values = json_response.unwrap();
        if vec_values.len() == 1 {
            return Some(serde_json::from_value(vec_values[0].clone()).unwrap());
        }
    }
    return None;
}

#[update]
async fn create_dispute(question_id: String, creation_date: i32) -> Option<DisputeType> {
    let json_str = graphql_query(
        queries::create_dispute::macros::mutation!().to_string(),
        format!(
            queries::create_dispute::macros::args!(),
            question_id,
            creation_date)).await;
    let json_data : Value = serde_json::from_str(&json_str).unwrap();
    let json_response = json_data["data"][queries::create_dispute::macros::response!()].as_array();
    if json_response != None {
        let vec_values = json_response.unwrap();
        if vec_values.len() == 1 {
            return Some(serde_json::from_value(vec_values[0].clone()).unwrap());
        }
    }
    return None;
}

#[update]
async fn set_winner(question_id: String, answer_id: String) -> bool {
    let json_str = graphql_query(
        queries::set_winner::macros::mutation!().to_string(),
        format!(
            queries::set_winner::macros::args!(),
            question_id,
            answer_id)).await;
    let json_data : Value = serde_json::from_str(&json_str).unwrap();
    return serde_json::from_value(json_data["data"][queries::set_winner::macros::response!()][0].clone()).unwrap();
    let json_response = json_data["data"][queries::set_winner::macros::response!()].as_array();
    if json_response != None {
        let vec_values = json_response.unwrap();
        if vec_values.len() == 1 {
            let question : QuestionType = serde_json::from_value(vec_values[0].clone()).unwrap();
            match question.winner {
                Some(answer) => return answer.id == answer_id,
                None         => return false,
            }
        }
    }
    return false;
}

#[update]
async fn set_winner_invoice(question_id: String, invoice_id: String) -> bool {
    let json_str = graphql_query(
        queries::set_winner_invoice::macros::mutation!().to_string(),
        format!(
            queries::set_winner_invoice::macros::args!(),
            question_id,
            invoice_id)).await;
    let json_data : Value = serde_json::from_str(&json_str).unwrap();
    let json_response = json_data["data"][queries::set_winner_invoice::macros::response!()].as_array();
    if json_response != None {
        let vec_values = json_response.unwrap();
        if vec_values.len() == 1 {
            let question : QuestionType = serde_json::from_value(vec_values[0].clone()).unwrap();
            match question.winner_invoice {
                Some(invoice) => return invoice.id == invoice_id,
                None          => return false,
            }
        }
    }
    return false;
}

#[query]
async fn get_invoice(invoice_id: String) -> Option<InvoiceType> {
    let json_str = graphql_query(
        queries::get_invoice::macros::query!().to_string(),
        format!(queries::get_invoice::macros::args!(), invoice_id)).await;
    let json_data : Value = serde_json::from_str(&json_str).unwrap();
    let json_response = json_data["data"][queries::get_invoice::macros::response!()].as_array();
    if json_response != None {
        let vec_values = json_response.unwrap();
        if vec_values.len() == 1 {
            return Some(serde_json::from_value(vec_values[0].clone()).unwrap());
        }
    }
    return None;
}

#[query]
async fn get_question(question_id: String) -> Option<QuestionType> {
    let json_str = graphql_query(
        queries::get_question::macros::query!().to_string(),
        format!(queries::get_question::macros::args!(), question_id)).await;
    let json_data : Value = serde_json::from_str(&json_str).unwrap();
    let json_response = json_data["data"][queries::get_question::macros::response!()].as_array();
    if json_response != None {
        let vec_values = json_response.unwrap();
        if vec_values.len() == 1 {
            return Some(serde_json::from_value(vec_values[0].clone()).unwrap());
        }
    }
    return None;
}

#[query]
async fn get_answer(answer_id: String) -> Option<AnswerType> {
    let json_str = graphql_query(
        queries::get_answer::macros::query!().to_string(),
        format!(queries::get_answer::macros::args!(), answer_id)).await;
    let json_data : Value = serde_json::from_str(&json_str).unwrap();
    let json_response = json_data["data"][queries::get_answer::macros::response!()].as_array();
    if json_response != None {
        let vec_values = json_response.unwrap();
        if vec_values.len() == 1 {
            return Some(serde_json::from_value(vec_values[0].clone()).unwrap());
        }
    }
    return None;
}

#[query]
async fn has_answered(question_id: String, author: String) -> bool {
    let json_str = graphql_query(
        queries::get_question_answers::macros::query!().to_string(),
        format!(queries::get_question_answers::macros::args!(), question_id, author)).await;
    let json_data : Value = serde_json::from_str(&json_str).unwrap();
    let json_response = json_data["data"][queries::get_question_answers::macros::response!()].as_array();
    return json_response != None && json_response.unwrap().len() != 0;
}
