import { observer } from 'mobx-react'
import router from 'next/router'
import React, { FormEventHandler, useContext } from 'react'
import { getGqlToken } from '../../libs/cookies'
import { fetchAPI } from '../../libs/fetchAPI'
import { PersonaStateContext } from '../../states/UserState'

export const PersonaCreateSteps: React.FC = observer(() => {
  const persona = useContext(PersonaStateContext)
  const token = getGqlToken()
  const createPersona: FormEventHandler = async (e) => {
    e.preventDefault()
    const query = `
    mutation {
      createPersona(name: "${persona.name}") {
        name
      }
    }
    `
    await fetchAPI(query, token)
    router.push('/')
  }

  return (
    <div>
      <form>
        <div>Type new persona name here:</div>
        <input
          type="text"
          value={persona.name}
          onChange={(e) => persona.updateName(e.target.value)}
        />
        <button onClick={(e) => createPersona(e)}>OK</button>
      </form>
    </div>
  )
})
