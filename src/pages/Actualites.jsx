import { newsItems } from '../data/news'

function Actualites() {
  return (
    <section className="container page">
      <h1>Actualités</h1>
      <ul className="news-list">
        {newsItems.map(n => (
          <li key={n.id}>
            <strong>{n.title}</strong>
            <div><small>{n.date}</small></div>
          </li>
        ))}
      </ul>
    </section>
  )
}

export default Actualites


