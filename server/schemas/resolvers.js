const { User } = require('../models');
const { AuthenticationError } = require('apollo-server-express');
const { signToken } = require('../utils/auth')

const resolvers = {
 Query:{
  me: async (parent, args, context) => {
    if (context.user) {
      return User.findOne({ _id: context.user._id })
    }
 
  },



  
    // me: async function (parent,id,context) {
    
    //     return await User.findById(id)
    // },
 allUsers:async function(parent, args){
    return await User.find({})
 }
    
 },
  Mutation:{
    addUser: async (parent, { username, email, password }) => {
        const user = await User.create({ username, email, password });
        const token = signToken(user);
        return { token, user };

        
      },


      login: async (parent, { email, password }) => {
        const user = await User.findOne({ email });
  
        if (!user) {
          throw new AuthenticationError('No user found with this email address');
        }
  
        const correctPw = await user.isCorrectPassword(password);
  
        if (!correctPw) {
          throw new AuthenticationError('Incorrect credentials');
        }
  
        const token = signToken(user);
  
        return { token, user };},
    // DeleteBook: async (parent, {id, bookId}) => {
    //     return await User.findOneAndUpdate(
    //       { _id: id },
    //       { $pull: { savedBooks: { _id: bookId} } },
    //       { new: true })
    //      },

        savedBook: async(parent,{ input}, context) => {
       if(context.user){
      
          const savedBookData = await User.findOneAndUpdate(
                { _id: context.user._id },
                { $addToSet: { savedBooks: input } },
                { new: true, runValidators: true })
                return savedBookData

          }
          throw AuthenticationError;
        },
      

    removeBook: async (parent, { bookId }, context) => {
      if(context.user){
          const updatedUser = User.findOneAndUpdate(
            { _id: context.user._id },
            {$pull: {savedBooks: {bookId: bookId} } },
            
            { new: true }
          
          )
          return updatedUser
          ;
        
        // throw new AuthenticationError('You need to be logged in!');
      }
    },




}
}


module.exports = resolvers