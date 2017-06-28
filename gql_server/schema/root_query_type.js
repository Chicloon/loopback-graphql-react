const graphql = require('graphql');
const { GraphQLObjectType, GraphQLList, GraphQLID, GraphQLNonNull } = graphql;
const axios = require('axios');

const apiPath = require('./apiPath');

const PersonType = require('./person_type');
const ProjectType = require('./project_type');
const BoardListType = require('./boardList_type');
const TaskType = require('./task_type');

const RootQuery = new GraphQLObjectType({
  name: 'RootQueryType',
  fields: () => ({
    persons: {
      type: new GraphQLList(PersonType),
      resolve(parentValue, args) {
        return axios.get(`${apiPath}/Persons`)
          .then(res => res.data);
      }
    },
    projects: { 
      type: new GraphQLList(ProjectType),
      resolve(parentValue, args) {
        return axios.get(`${apiPath}/Projects`)
          .then(res=> res.data);
      }
    },
    boardLists: { 
      type: new GraphQLList(BoardListType),
      resolve(parentValue, args) {
        return axios.get(`${apiPath}/BoardLists`)
          .then(res=> res.data);
      }
    },
    tasks: { 
      type: new GraphQLList(TaskType),
      resolve(parentValue, args) {
        return axios.get(`${apiPath}/Tasks`)
          .then(res=> res.data);
      }
    },
     task: {
      args: { id: { type: new GraphQLNonNull(GraphQLID) } },
      type: TaskType,
      resolve(parentValue, args) {
        return axios.get(`${apiPath}/Tasks/${args.id}`)
          .then(res=> res.data);
      }
    },        
  }),
});

module.exports = RootQuery;
