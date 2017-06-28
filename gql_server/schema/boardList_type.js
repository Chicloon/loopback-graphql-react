const graphql = require('graphql');
const { GraphQLObjectType, GraphQLString, GraphQLBoolean, GraphQLInt, GraphQLID, GraphQLList } = graphql;
const axios = require('axios');

const apiPath = require('./apiPath');

const BoardListType = new GraphQLObjectType({
  name: 'BoardListType',
  fields: () => ({
    id: { type: GraphQLID },
    name: { type: GraphQLString },
    priority: { type: GraphQLInt },
    description: { type: GraphQLString },
    private: { type: GraphQLBoolean },
    projectId: { type: GraphQLID },
    project: {
      type: require('./project_type'),
      resolve(parentValue, args) {
        return axios.get(`${apiPath}/BoardLists/${parentValue.id}/project`)
          .then(res => res.data)
      }
    },
    person: {
      type: require('./person_type'),
      resolve(parentValue, args) {
        return axios.get(`${apiPath}/BoardLists/${parentValue.id}/person`)
          .then(res => res.data)
      }
    },
  })
});

module.exports = BoardListType;
