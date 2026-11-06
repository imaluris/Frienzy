import { timeOf, type ChatItem } from '../chat/groupMessages'
import { Avatar } from '../ui/Avatar'
import { Icon } from '../ui/Icon'

interface Props {
  item: ChatItem
  authorName: string
  /** Solo l'organizzatore può cancellare: se manca, il pulsante non c'è. */
  onDelete: (() => void) | null
}

// Un fumetto: i miei a destra in terracotta, gli altri a sinistra con avatar e nome.
export function ChatBubble({ item, authorName, onDelete }: Props) {
  const { message, mine, showAuthor } = item
  return (
    <li className={`chat-row${mine ? ' mine' : ''}`}>
      {!mine && <span className="chat-avatar">{showAuthor && <Avatar name={authorName} size="sm" />}</span>}
      <div className="chat-bubble-wrap">
        {showAuthor && <span className="chat-author">{authorName}</span>}
        <div className="chat-bubble">
          <p>{message.testo}</p>
          <span className="chat-meta">
            <time dateTime={message.creatoIl.toISOString()}>{timeOf(message.creatoIl)}</time>
          </span>
        </div>
      </div>
      {onDelete && (
        <button type="button" className="chat-delete" aria-label={`Cancella il messaggio di ${mine ? 'te' : authorName}`} onClick={onDelete}>
          <Icon name="trash" size={20} />
        </button>
      )}
    </li>
  )
}
