const graphql = require('graphql');
const { GraphQLObjectType, GraphQLString, GraphQLID, GraphQLList, isOutputType } = graphql;

const fullName = (firstName, lastName, middleName) => {
  return  `${lastName ? lastName + ' ' : ''}${firstName ? firstName.charAt(0) + '.' : ''}${middleName ? middleName.charAt(0) + '.' : ''}`;  
}

const PersonType = new GraphQLObjectType({
  name: 'PersonType',
  fields: () => ({
    id: { type: GraphQLID },
    firstName: { type: GraphQLString },
    lastName: { type: GraphQLString },
    middleName: { type: GraphQLString },
    paymentInfo: { type: GraphQLString },
    avatar: { type: GraphQLString },
    comment: { type: GraphQLString },
    name: {
      type:  GraphQLString,
      resolve({firstName, lastName, middleName}) {
        return fullName(firstName, lastName, middleName);      
      }
    }
  })
});

module.exports = PersonType;
