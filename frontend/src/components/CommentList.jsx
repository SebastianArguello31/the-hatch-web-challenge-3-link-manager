export default function CommentList({ comments }) {
    if (comments.length === 0) {
        return <p>Todavía no hay comentarios.</p>;
    }

    return (
        <ul className="comment-list">
            {comments.map((comment) => (
                <li key={comment.id}>
                    <strong>{comment.author}</strong>
                    {" · "}
                    <time dateTime={comment.created_at}>
                        {new Date(comment.created_at).toLocaleString("es")}
                    </time>

                    <p>{comment.content}</p>
                </li>
            ))}
        </ul>
    );
}