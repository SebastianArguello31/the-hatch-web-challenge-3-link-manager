// El padre controla el valor elegido y recibe la selección mediante onChange.
// Este componente solo muestra las opciones; no consulta la API.
export default function TagFilter({ tags, value, onChange, disabled = false, }) {
    return (
        <div>
            <label htmlFor="tag-filter">Filtrar por etiqueta</label>
            <select id="tag-filter" value={value} onChange={(event) => onChange(event.target.value)} disabled={disabled}>
                <option value="">Todas las etiquetas</option>

                {tags.map((tag) => (
                    <option key={tag.id} value={tag.name}>
                        {tag.name}
                    </option>
                ))}
            </select>
        </div>
    );
}
