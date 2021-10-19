import { observer } from 'mobx-react'
import React from 'react'
import { PostState } from '../../states/PostState'

import { Thread } from './Thread'
import { CardTitle } from '../common/CardTitle'
import { Author } from '../common/Author'
import { CardContent } from '../common/CardContent'
import { CardIcons } from '../common/CardIcons'
import { CardMeta } from '../common/CardMeta'
import { CreatedAt } from '../common/CreatedAt'
import { CommentInput } from './CommentInput'

export interface PostProps {
  post: PostState
}

export const Post: React.FC<PostProps> = observer((props) => {
  return (
    <div className="max-w-2xl rounded-lg p-4 bg-white">
      <CardTitle title={props.post.title} />
      <Author name={props.post.author.name} iconUrl={props.post.author.iconUrl} />
      <CardContent content={props.post.content} />
      <CardMeta>
        <CardIcons
          commentNumber={props.post.responseNumber}
          upvote={props.post.upvote}
          downvote={props.post.downvote}
        />
        <div className="pb-2" />
        <CreatedAt created={props.post.createdAt} />
      </CardMeta>
      <div className="pb-5" />
      <CommentInput />
      <div className="pt-8 pb-2 border-b-2 border-black border-opacity-10">Sort by BEST</div>
      <div className="pb-8" />
      {props.post.hasRepsponse ? (
        <Thread posts={props.post.responses} />
      ) : (
        <div>No Comments Yet</div>
      )}
    </div>
  )
})