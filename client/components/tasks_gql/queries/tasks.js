import gql from 'graphql-tag';

export default gql`
  {
    tasks{
      id
      name
      project{
        id
        name
      } 
      boardList{
        id
        name
      }
      person{
        id
        name
      }
      private
      startDate
      dueDate    
    }
  }
`;