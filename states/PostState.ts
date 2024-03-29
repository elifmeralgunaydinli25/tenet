import { makeAutoObservable } from 'mobx'
import { createContext } from 'react'
import { PersonaState } from './UserState'
import { queryDocuments } from '../server/graphql-schema/queryDocuments'
import type { GetPostQuery } from '../server/generated-files/frontend-graphql-definition'

export interface PersonaType {
  id: number
  name: string
  screenName: string
  iconUrl: string
}

export interface BaseContentType {
  id: string
  content: string
  persona: PersonaType
  createdAt: string
  privilege: GetPostQuery['post']['privilege']
}

export interface BoardType extends BaseContentType {
  title: string
  boardId: string
  description: string
  posts: PostType[]
  persona: PersonaType
}

export interface PostType extends BaseContentType {
  board: Pick<BoardType, 'id' | 'title' | 'description'>
  boardId: string
  title: string
  threads: ThreadType[]
  persona: PersonaType
}

export interface ThreadType extends BaseContentType {
  replies: BaseContentType[]
  board: Pick<BoardType, 'id' | 'title'>
  postId: string
  persona: PersonaType
}

export class PostState {
  private readonly children: PostState[] = []
  parent: PostState | undefined
  id: string
  boardId: string
  title: string
  content: string
  author: PersonaState
  upvote: number
  downvote: number
  createdAt: string
  public privilege: GetPostQuery['post']['privilege']
  readonly imageUrls: string[]
  constructor(
    data: Pick<
      GetPostQuery['post'],
      'id' | 'boardId' | 'title' | 'content' | 'createdAt' | 'privilege'
    > & {
      author: PersonaState
      upvote?: number
      downvote?: number
      children?: PostState[]
      parent?: PostState
      imageUrls?: string[]
    }
  ) {
    this.id = data.id
    this.boardId = data.boardId
    this.title = data.title
    this.content = data.content
    this.author = data.author
    this.children = data.children ?? []
    this.parent = data.parent
    this.privilege = data.privilege
    this.upvote = data.upvote ?? 0
    this.downvote = data.downvote ?? 0
    this.createdAt = data.createdAt
    this.imageUrls = data.imageUrls ?? []
    makeAutoObservable(this)
  }
  addResponse(state: PostState): PostState {
    this.children.push(state)
    return this
  }
  get responses(): PostState[] {
    return this.children
  }
  get responseNumber(): number {
    return this.children.length
  }
  get hasRepsponse(): boolean {
    return this.children.length !== 0
  }
  static fromBoardTypeJSON(json: BoardType): PostState {
    return new PostState({
      ...json,
      author: new PersonaState(json.persona),
      children: json.posts.map((v) => this.fromPostTypeJSON(v)),
    })
  }
  static fromPostTypeJSON(json: PostType): PostState {
    return new PostState({
      ...json,
      author: new PersonaState(json.persona),
      children: json.threads.map((v) => this.fromThreadTypeJSON(v)),
    })
  }
  static fromThreadTypeJSON(json: ThreadType): PostState {
    return new PostState({
      ...json,
      boardId: json.board.id,
      title: json.board.title,
      author: new PersonaState(json.persona),
      children: json.replies.map(
        (v) =>
          new PostState({
            ...v,
            boardId: json.board.id,
            title: json.board.title,
            author: new PersonaState(v.persona),
          })
      ),
    })
  }
}

export class BoardState {
  private readonly _id: string
  private readonly _title: string = ''
  private readonly _description: string = ''
  private readonly _posts: PostState[] = []
  private readonly _fetcherDocument: string
  constructor(
    id: string,
    fetcherDocument: string,
    opts?: { title: string; description: string; posts: PostState[] }
  ) {
    this._id = id
    this._fetcherDocument = fetcherDocument
    if (opts) {
      this._title = opts.title
      this._description = opts.description
      this._posts = opts.posts
    }
    makeAutoObservable(this)
  }
  get id(): string {
    return this._id
  }
  get fetcherDocument(): string {
    return this._fetcherDocument
  }
  get description(): string {
    return this._description
  }
  get title(): string {
    return this._title
  }
  get posts(): PostState[] {
    return this._posts
  }
}

export const BoardStateContext = createContext(new BoardState('', queryDocuments.Query.board))
