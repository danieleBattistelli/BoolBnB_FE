import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import "./detailPageCss.css";
import ReviewModale from "../components/ReviewModale";
import SendEmail from "../components/SendEmail";
import { useAlertContext } from "../contexts/AlertContext";
import { mockImmobili } from "../mockData";
import ErrorBoundary from "../components/ErrorBoundary"; // Importa ErrorBoundary

function PaginaDettaglio() {
    const { slug } = useParams();
    const [immobile, setImmobile] = useState(null);
    const [caricamento, setCaricamento] = useState(true);
    const [errore, setErrore] = useState(null);
    const [heartCount, setHeartCount] = useState(0);
    const images = ["image1.jpg", "image2.jpg", "image3.jpg"]; // Immagini statiche

    const { setError } = useAlertContext();
    const { setMessage } = useAlertContext();

    const showImmobile = () => {
        const immobile = mockImmobili.find((immobile) => immobile.slug === slug);
        if (immobile) {
            setImmobile(immobile);
            const savedHeartCounts = JSON.parse(localStorage.getItem("heartCounts")) || {};
            setHeartCount(savedHeartCounts[immobile.id] || 0);
        } else {
            setErrore("Errore nel recupero dei dati");
        }
        setCaricamento(false);
    };

    useEffect(() => {
        window.scrollTo(0, 0);
        showImmobile();
    }, [slug]);

    if (caricamento) return <p>Caricamento...</p>;
    if (!immobile) return <p>Elemento non trovato</p>;

    const alloggio = immobile.tipi_alloggio.map((tipo) => tipo.nome_tipo_alloggio).join(", ");

    //Implemento le stelle per il rating dell'immobile

    const renderStars = (voto) => {
        const fullStars = Math.ceil(voto);
        const emptyStars = 5 - fullStars;
        const stars = [];
        for (let i = 0; i < fullStars; i++) {
            stars.push(<i key={`full-${i}`} className="fa-solid fa-star"></i>);
        }
        for (let i = 0; i < emptyStars; i++) {
            stars.push(<i key={`empty-${i}`} className="fa-regular fa-star"></i>);
        }
        return stars;
    };

    // Funzione per evidenziare l'elemento di destinazione
    const handleHighlight = (event) => {
        event.preventDefault();
        const targetId = event.currentTarget.getAttribute("href").substring(1);
        const targetElement = document.getElementById(targetId);
        if (targetElement) {
            targetElement.classList.add("highlight");
            targetElement.scrollIntoView({ behavior: "smooth", block: "center", inline: "center" });
            setTimeout(() => {
                targetElement.classList.add("highlight-remove");
            }, 1500);
            setTimeout(() => {
                targetElement.classList.remove("highlight", "highlight-remove");
            }, 3000);
        }
    };

    const handleLike = (event) => {
        event.stopPropagation();
        event.preventDefault();
        const newHeartCount = heartCount + 1;
        const savedHeartCounts = JSON.parse(localStorage.getItem("heartCounts")) || {};
        savedHeartCounts[immobile.id] = newHeartCount;
        localStorage.setItem("heartCounts", JSON.stringify(savedHeartCounts));
        setHeartCount(newHeartCount);
    };

    const handleSubmit = (nuovaRecensione) => {
        console.log(nuovaRecensione);

        axios.post(`${apiUrl}/recensioni/${immobile.id}`, nuovaRecensione)
            .then(response => {
                console.log("Recensione inviata con successo", response.data);
                setMessage("Recensione inviata con successo!");
                setTimeout(() => {
                    setMessage("");
                }, 5000);
                showImmobile();
            })
            .catch(error => {
                console.error("Errore nell'invio della recensione", error);
                setError("Errore nell'invio della recensione");
                setTimeout(() => {
                    setError("");
                }, 5000);
            });
    };

    return (
        <ErrorBoundary>
            <main>
                <section className="container my-3">
                    <div id="immobile">
                        <div id="title" className="d-flex py-2">
                            <h2>
                                <a href="#adress" onClick={handleHighlight}><i className="fa-solid fa-location-dot me-1"></i>
                                    {immobile.titolo_descrittivo}
                                </a>
                            </h2>
                        </div>
                        <div id="carouselExampleIndicators" className="carousel slide img-container">
                            {/* Indicatori dinamici */}
                            <div className="carousel-indicators">
                                {images.map((_, index) => (
                                    <button
                                        key={index}
                                        type="button"
                                        data-bs-target="#carouselExampleIndicators"
                                        data-bs-slide-to={index}
                                        className={index === 0 ? "active" : ""}
                                        aria-current={index === 0 ? "true" : undefined}
                                        aria-label={`Slide ${index + 1}`}
                                    ></button>
                                ))}
                            </div>

                            <div className="d-flex justify-content-center align-items-center mb-2 like">
                                <button className="btn" onClick={handleLike}>❤️</button>
                                <span>{heartCount}</span>
                            </div>

                            {/* Immagini dinamiche */}
                            <div className="carousel-inner">
                                {images.map((curImage, index) => (
                                    <div key={curImage} className={`carousel-item ${index === 0 ? "active" : ""}`}>
                                        <img
                                            src={`/images/${curImage}`}
                                            alt={`Slide ${index + 1}`}
                                            onError={(e) => e.target.src = 'https://placehold.co/600x400'}
                                        />
                                    </div>
                                ))}
                            </div>

                            {/* Pulsanti di controllo */}
                            <button className="carousel-control-prev" type="button" data-bs-target="#carouselExampleIndicators" data-bs-slide="prev">
                                <span className="carousel-control-prev-icon" aria-hidden="true"></span>
                                <span className="visually-hidden">Previous</span>
                            </button>
                            <button className="carousel-control-next" type="button" data-bs-target="#carouselExampleIndicators" data-bs-slide="next">
                                <span className="carousel-control-next-icon" aria-hidden="true"></span>
                                <span className="visually-hidden">Next</span>
                            </button>
                        </div>

                        <hr />
                        <div id="adress">
                            <span><i className="fa-solid fa-map-pin"></i> <strong>Indirizzo:</strong> {immobile.indirizzo_completo}</span>
                        </div>
                        <hr />
                        <div id="info" className="py-2">
                            <div id="descrizione">
                                <h5 className="pb-2">DESCRIZIONE</h5>
                                <p>{immobile.descrizione}</p>
                            </div>
                            <hr />
                            <div className="dettagli row">
                                <h5 className="pb-2">Dettagli della struttura</h5>
                                <div className="col-6">
                                    <p>
                                        <i className="fa-solid fa-up-right-and-down-left-from-center"></i> MQ: {immobile.mq}
                                    </p>
                                    <p>
                                        <i className="fa-solid fa-bath"></i> Bagni: {immobile.bagni}
                                    </p>
                                </div>
                                <div className="col-6">
                                    <p>
                                        <i className="fa-solid fa-door-open"></i> Locali: {immobile.locali}
                                    </p>
                                    <p>
                                        <i className="fa-solid fa-bed"></i> Posti letto: {immobile.posti_letto}
                                    </p>
                                </div>
                                <div className="col-6">
                                    <p>
                                        <i className="fa-solid fa-house-chimney"></i> Tipo di alloggio: {alloggio}
                                    </p>
                                </div>
                            </div>
                            <hr />
                            <div id="info" className="py-2">
                                <h5>INFO E CONTATTI</h5>

                                <div>
                                    <SendEmail />
                                </div>
                            </div>
                            <hr />

                        </div>
                    </div>
                    <div id="recensioni" className="pt-5">
                        <div id="titolo_recensioni" className="d-flex justify-content-between">
                            <div className="pb-2">
                                <h3>Recensioni clienti</h3>
                                <span>
                                    {immobile?.tot_recensioni === 1
                                        ? `${immobile.tot_recensioni} valutazione globale`
                                        : `${immobile.tot_recensioni} valutazioni globali`}
                                </span>
                            </div>
                            <div className="align-items-center d-flex flex-column justify-content-center px-3">
                                <span className="justify-content-center"><strong>Voto medio</strong></span>
                                <span>
                                    {renderStars(immobile.voto_medio)} {immobile.voto_medio.toFixed(1)} su 5
                                </span>

                            </div>
                        </div>
                    </div>
                    <div className="recensione">
                        {immobile.recensioni.map((curRecensione, i) => (
                            <div key={i} className="card shadow-sm mb-3">
                                <div className="card-header d-flex justify-content-between align-items-center">
                                    <h3>{curRecensione.username
                                        .replace(/_/g, ' ')  // Sostituisci gli underscore con uno spazio
                                        .replace(/\b\w/g, letter => letter.toUpperCase())}
                                    </h3>
                                    <div className="d-flex align-items-center flex-column">
                                        <span className="px-1">
                                            {renderStars(curRecensione.voto)} {curRecensione.voto} su 5
                                        </span>
                                        <span></span>
                                        <span>Recensione del: {new Date(curRecensione.data).toLocaleDateString()}</span>
                                    </div>
                                </div>
                                <div className="card-body  fw-medium">
                                    <span>{curRecensione.recensione}</span> <br />

                                </div>
                            </div>
                        ))}
                    </div>
                    <div id="nuova_recensione" className="d-flex py-3">
                        <ReviewModale
                            handleSubmit={handleSubmit}
                            immobile={immobile}
                        />
                    </div>
                </section >
                <Link className="btn btn-secondary ms-5" to="/"><i className="fa-solid fa-arrow-left"></i> Indietro</Link>

            </main >
        </ErrorBoundary>
    );
}

export default PaginaDettaglio;