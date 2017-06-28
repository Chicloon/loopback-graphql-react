const graphql = require('graphql');
const { GraphQLObjectType, GraphQLString, GraphQLBoolean, GraphQLInt, GraphQLID, GraphQLList } = graphql;
const axios = require('axios');

const apiPath = require('./apiPath');

const nullCheck = (date) => {
  return date ? date : '-';
};

const TaskType = new GraphQLObjectType({
  name: 'TaskType',
  fields: () => ({
    id: { type: GraphQLID },
    name: { type: GraphQLString },
    priority: { type: GraphQLInt },
    description: { type: GraphQLString },
    private: { type: GraphQLBoolean },
    // personId: { type: GraphQLID },
    // projectId: { type: GraphQLID },
    // boardListId: { type: GraphQLID },
    startDate: { type: GraphQLString },


    dueDate: { type: GraphQLString },

    project: {
      type: require('./project_type'),
      resolve(parentValue, args) {
        return axios.get(`${apiPath}/Tasks/${parentValue.id}/project`)
          .then(res => res.data);
      }
    },
    person: {
      type: require('./person_type'),
      resolve(parentValue, args) {
        return axios.get(`${apiPath}/Tasks/${parentValue.id}/person`)
          .then(res => res.data);
      }
    },
    boardList: {
      type: require('./boardList_type'),
      resolve(parentValue, args) {
        return axios.get(`${apiPath}/Tasks/${parentValue.id}/boardList`)
          .then(res => res.data);
      }
    }
  })
});

module.exports = TaskType;