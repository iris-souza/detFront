import React, { useState, useEffect } from 'react';

function MysterySelector({ onSelectMystery }) {
    const [mysteries, setMysteries] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const HTTP_SERVER_URL = "https://detetive-generativo-backend.onrender.com"; 


    useEffect(() => {
        const fetchMysteries = async () => {
            try {
                const response = await fetch(`${HTTP_SERVER_URL}/historias`);
                if (!response.ok) {
                    throw new Error(`Erro HTTP! status: ${response.status}`);
                }
                const data = await response.json();
                setMysteries(data);
            } catch (e) {
                console.error("Erro ao carregar mistérios:", e);
                setError('Erro ao carregar mistérios. Verifique se o backend está rodando em ' + HTTP_SERVER_URL);
            } finally {
                setLoading(false);
            }
        };
        fetchMysteries();
    }, []);

    if (loading) return <p>Carregando mistérios...</p>;
    if (error) return <p style={{ color: '#ff6b6b' }}>{error}</p>;

    return (
        <div>
            <h2>Escolha seu Mistério</h2>
            {mysteries.length === 0 ? (
                <p>Nenhum mistério disponível no momento. Verifique o arquivo 'historias.json' no seu backend.</p>
            ) : (
                <div id="mystery-list">
                    {mysteries.map(mystery => (
                        <div key={mystery.id} className="mystery-item">
                            <h3>{mystery.titulo}</h3>
                            <p>{mystery.resumo}</p>
                            {mystery.duracoes.map(dur => (
                                <button 
                                    key={dur} 
                                    onClick={() => onSelectMystery(mystery.id, dur)}
                                >
                                    Jogar ({dur.charAt(0).toUpperCase() + dur.slice(1)})
                                </button>
                            ))}
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}

export default MysterySelector;