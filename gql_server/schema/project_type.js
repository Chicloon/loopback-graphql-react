const graphql = require('graphql');
const { GraphQLObjectType, GraphQLString, GraphQLBoolean, GraphQLInt, GraphQLID, GraphQLList } = graphql;

const axios = require('axios');

const apiPath = require('./apiPath');

const ProjectType = new GraphQLObjectType({
  name:  'ProjectType',
  fields: () => ({
    id: { type: GraphQLID },     
    name: { type: GraphQLString },
		priority: { type: GraphQLInt },
		private: { type: GraphQLBoolean },
    description: { type: GraphQLString },
    clientId: { type: GraphQLID },
    client: {
      type: require('./client_type'),
      resolve(parentValue){
        console.log(parentValue.clientId);
        return axios.get(`${apiPath}/Clients/${parentValue.clientId}`)
          .then(res=> res.data);
      }
    }
  })
});

module.exports = ProjectType;
