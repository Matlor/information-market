#[macro_use]
pub mod macros {
    macro_rules! mutation{
        () => {
            r#"mutation ($author: String!, $invoice_id: ID!, $creation_date: Int!, $status_update_date: Int!, $content: String!, $reward: Int!) {
              createQuestion(
                input: {author: $author, author_invoice: {connect: $invoice_id}, creation_date: $creation_date, status: OPEN, status_update_date: $status_update_date, content: $content, reward: $reward}
              ) {
                id
                author
                author_invoice {
                  id
                  buyer
                }
                creation_date
                status
                status_update_date
                content
                reward
                winner {
                  id
                  author
                  creation_date
                  content
                }
                close_transaction_block_height
              }
            }"#
        }
    }
    macro_rules! args{
        () => {
            r#"{{
              "author": "{}",
              "invoice_id": "{}",
              "creation_date": {},
              "status_update_date": {},
              "content": "{}",
              "reward": {}
            }}"#
        }
    }
    macro_rules! response{
        () => {
            "createQuestion"
        }
    }
    pub(crate) use mutation;
    pub(crate) use args;
    pub(crate) use response;
}