import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { moviesAPI, getImageUrl } from '../services/api';
import MovieSlider from '../components/MovieSlider';

const PersonDetails = () => {
    const { id } = useParams();
    const [person, setPerson] = useState(null);
    const [credits, setCredits] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        window.scrollTo(0, 0);
        fetchPersonData();
    }, [id]);

    const fetchPersonData = async () => {
        setLoading(true);
        try {
            const [personRes, creditsRes] = await Promise.all([
                moviesAPI.getPersonDetails(id),
                moviesAPI.getPersonCredits(id)
            ]);

            setPerson(personRes.data);
            // Sort credits by popularity and remove duplicates
            const uniqueCredits = Array.from(new Set(creditsRes.data.cast.map(a => a.id)))
                .map(id => creditsRes.data.cast.find(a => a.id === id))
                .sort((a, b) => b.popularity - a.popularity);

            setCredits(uniqueCredits);
        } catch (error) {
            console.error('Error fetching person details:', error);
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-dark-500 pt-20 flex justify-center">
                <div className="w-16 h-16 border-4 border-red-500 border-t-transparent rounded-full animate-spin"></div>
            </div>
        );
    }

    if (!person) {
        return (
            <div className="min-h-screen bg-dark-500 flex items-center justify-center">
                <div className="text-center">
                    <div className="text-6xl mb-4">😕</div>
                    <h2 className="text-2xl font-bold text-white mb-2">Person not found</h2>
                    <Link to="/movies" className="btn-primary">Browse Movies</Link>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-dark-500 pt-24 px-4 sm:px-6 lg:px-8">
            <div className="max-w-7xl mx-auto">
                <div className="flex flex-col md:flex-row gap-8 mb-12">
                    {/* Profile Image */}
                    <div className="flex-shrink-0 mx-auto md:mx-0">
                        <img
                            src={getImageUrl(person.profile_path, 'w500')}
                            alt={person.name}
                            className="w-64 h-96 object-cover rounded-xl shadow-2xl"
                            onError={(e) => {
                                e.target.src = 'https://via.placeholder.com/300x450?text=No+Image';
                            }}
                        />
                    </div>

                    {/* Info */}
                    <div className="flex-1">
                        <h1 className="text-4xl md:text-5xl font-bold text-white mb-4 text-shadow">{person.name}</h1>

                        <div className="flex flex-wrap gap-6 text-gray-300 mb-6">
                            {person.birthday && (
                                <div>
                                    <span className="block text-gray-500 text-sm">Born</span>
                                    <span className="font-medium">
                                        {new Date(person.birthday).toLocaleDateString()}
                                        {person.deathday ? ` - ${new Date(person.deathday).toLocaleDateString()}` : ` (${new Date().getFullYear() - new Date(person.birthday).getFullYear()} years old)`}
                                    </span>
                                </div>
                            )}
                            {person.place_of_birth && (
                                <div>
                                    <span className="block text-gray-500 text-sm">Place of Birth</span>
                                    <span className="font-medium">{person.place_of_birth}</span>
                                </div>
                            )}
                            {person.known_for_department && (
                                <div>
                                    <span className="block text-gray-500 text-sm">Known For</span>
                                    <span className="font-medium">{person.known_for_department}</span>
                                </div>
                            )}
                        </div>

                        <div className="mb-8">
                            <h3 className="text-xl font-semibold text-white mb-3">Biography</h3>
                            <p className="text-gray-300 leading-relaxed whitespace-pre-line">
                                {person.biography || "No biography available."}
                            </p>
                        </div>
                    </div>
                </div>

                {/* Known For (Movies) */}
                {credits.length > 0 && (
                    <section className="mt-12">
                        <MovieSlider title="Known For" movies={credits} />
                    </section>
                )}
            </div>
        </div>
    );
};

export default PersonDetails;
