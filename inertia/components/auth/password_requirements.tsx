import { CheckCircleIcon } from '@heroicons/react/20/solid'
import { List, ListItem } from '@astryxdesign/core/List'
import { Icon } from '@astryxdesign/core/Icon'
import type { PasswordRequirement } from '@adonisplus/persona/password_policy/types'

function describe(requirement: PasswordRequirement) {
  switch (requirement.rule) {
    case 'minLength':
      return `At least ${requirement.min} characters`
    case 'maxLength':
      return `At most ${requirement.max} characters`
    case 'letters':
      return 'At least one letter'
    case 'mixedCase':
      return 'Uppercase and lowercase letters'
    case 'numbers':
      return 'At least one number'
    case 'symbols':
      return 'At least one symbol'
    case 'minScore':
      return 'Hard to guess'
  }
}

/** The password policy's rules, each ticked once the typed password meets it. */
export default function PasswordRequirements({
  requirements,
}: {
  requirements: PasswordRequirement[]
}) {
  return (
    <List aria-label="Password requirements" edge="flush" density="compact">
      {requirements.map((requirement) => (
        <ListItem
          key={requirement.rule}
          data-met={requirement.met}
          label={describe(requirement)}
          startContent={
            <Icon
              icon={CheckCircleIcon}
              size="sm"
              color={requirement.met ? 'success' : 'disabled'}
            />
          }
        />
      ))}
    </List>
  )
}
