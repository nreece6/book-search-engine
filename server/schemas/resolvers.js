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
    }
}