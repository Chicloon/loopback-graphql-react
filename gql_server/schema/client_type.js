const graphql = require('graphql');
const { GraphQLObjectType, GraphQLString, GraphQLBoolean, GraphQLInt, GraphQLID, GraphQLList } = graphql;

const ClientType = new GraphQLObjectType({
  name:  'ClientType',
  fields: () => ({
    id: { type: GraphQLID },     
    name: { type: GraphQLString },
		personName: { type: GraphQLString },
    personRole: { type: GraphQLString },
    phone: { type: GraphQLString },
    email: { type: GraphQLString },		
    comment: { type: GraphQLString },  
  })
});

module.exports = ClientType;
