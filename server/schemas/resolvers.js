const { AuthenticationError } = require("apollo-server-express")
const { User } = require("../models")
const { signToken } = require("../utils/auth")

const resolvers = {
    Query: {
        me: async (parent, args, context) => {
            if (context.user) {
                const userData = await User.findOne({ _id: context.user._id }).select(
                    '-_v -password'
                )

                return userData
            }

            throw new AuthenticationError('Not Logged In')
        }
    },

    Mutation: {
        addUser: async (parent, args) => {
            const user = await User.create(args)
            const token = signToken(user)

            return { token, user }

        },

        login: async (parent, { email, password }) => {
            const user = await User.findOne({ email })

            if (!user) {
                throw new AuthenticationError('Something went wrong. Please check your email and password.')
            }

            const correctPw = await user.isCorrectPassowrd(password)

            if (!correctPw) {
                throw new AuthenticationError('Incorrect password entered.')
            }

            const token = signToken(user)
            return { token, user }
        },

        saveBook: async (parent, { bookData }, context) => {
            if (context.user) {
                const updatedUser = await User.findByIdAndUpdate(
                 { _id: context.user._id },
                 { $push: { savedBooks: bookData } },
                 { new: true }
                )

                return updatedUser
            }

            throw new AuthenticationError('You must be logged in to save a book.')
        },

        removeBook: async (parent, { bookId }, context ) => {
            if (context.user) {
                const updatedUser = await User.findOneByIdAndUpdate(
                    { _id: context.user._id },
                    { $pull: { savedBooks: { bookId }} },
                    { new: true }
                )

                return updatedUser
            }

            throw new AuthenticationError('You must be logged in to remove a saved book.')
        }
    }
}

module.exports = resolvers