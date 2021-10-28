import { ApolloServer, gql, IResolvers } from 'apollo-server'
import { PrismaClient, User } from '@prisma/client'
import { ExpressContext } from 'apollo-server-express/dist/index'
import jwt from 'jsonwebtoken'
import dotenv from 'dotenv'

dotenv.config()

const prisma = new PrismaClient()

const typeDefs = gql`
  type User {
    personas: [Persona]
  }
  type Persona {
    name: String
    iconUrl: String
  }
  type Board {
    title: String
    posts: [Post]
  }
  type Post {
    title: String
    content: String
    threads: [Thread]
    persona: Persona
  }
  type Thread {
    content: String
    replies: [Reply]
    persona: Persona
  }
  type Reply {
    content: String
    persona: Persona
  }
  type Query {
    me: User
    persona(name: String!): Persona
    personas(names: [String]!): [Persona]
    removeUser(name: String!): Boolean
    board(title: String!): Board
    activities: [Post]
  }
`

const resolvers: IResolvers<void, ContextType> = {
  Query: {
    me: (_1, _2, context) => {
      return context.me
    },
    persona: (_1, args: { name: string }, context) => {
      return context.prisma.persona.findFirst({
        where: {
          name: args.name,
        },
      })
    },
    personas: (_1, args: { names: string[] }, context) => {
      return context.prisma.persona.findMany({
        where: {
          name: {
            in: args.names,
          },
        },
      })
    },
    removeUser: () => {
      return false // need to check tokens. wip.
    },
    board: (_1, args: { title: string }, context) => {
      return context.prisma.board.findFirst({
        where: {
          title: args.title,
        },
        include: {
          posts: {
            include: {
              threads: {
                include: {
                  replies: true,
                },
              },
            },
          },
        },
      })
    },
    activities: (_1, _2, context) => {
      return context.prisma.post.findMany({
        include: {
          persona: true,
        },
      })
    },
  },
}

type ContextType = {
  me: User | null
  prisma: typeof prisma
}
type ContextFunction = (args: ExpressContext) => Promise<ContextType>

const context: ContextFunction = async ({ req }) => {
  const token = req.headers.authorization
  let me: User | null = null
  if (token && process.env.API_TOKEN_SECRET) {
    try {
      const decoded = jwt.verify(token, process.env.API_TOKEN_SECRET) as Record<string, string>
      me = await prisma.user.findFirst({
        where: { token: decoded.sub },
        include: { personas: true },
      })
      if (!me) {
        me = await prisma.user.create({
          data: {
            token: decoded.sub,
          },
        })
      }
    } catch {
      // do nothing. just ignore it.
    }
  }

  return {
    me,
    prisma,
  }
}

const main: () => void = () => {
  const server = new ApolloServer({ typeDefs, resolvers, context })
  server.listen().then(({ url }) => {
    console.log(`🚀  Server ready at ${url}`)
  })
}

main()