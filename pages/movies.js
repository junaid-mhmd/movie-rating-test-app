/* eslint-disable @next/next/no-img-element */
import React, { useEffect, useState } from "react";
import axios from "axios";
import { useRouter } from "next/router";
import styles from '../styles/Movies.module.css'
import { BaseImageUrl } from '../utils/Base'
import { Button, Spinner, useToast } from "@chakra-ui/react"

function Movies() {
    const [movies, setMovies] = useState([]);
    const [unvotedMovies, setUnvotedMovies] = useState([]);
    const [votedMovies, setVotedMovies] = useState([]);
    const [displayMovies, setDisplayMovies] = useState({ firstItem: "", secondItem: "" })
    const [loading, setLoading] = useState(false)
    const [selectedMovie, setSelectedMovie] = useState()
    const [isFinished, setFinished] = useState(false)
    const [moviesLength, setMoviesLength] = useState()
    const toast = useToast()

    const router = useRouter();

    useEffect(() => {
        if (!router.query.language && !router.query.genres) {
            router.push('/')
        }
        getMovies()

        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const getMovies = () => {
        setLoading(true)

        var options = {
            method: "GET",
            url: "https://api.themoviedb.org/3/discover/movie",
            params: {
                api_key: "30e62b9285c0d60c99033e04ad82abac",
                with_genres: router.query.genres,
                with_original_language: router.query.language,
                page: "1",

            },
        };

        axios
            .request(options)
            .then(function (response) {
                setMovies(response.data.results);
                setDisplayMovies({ firstItem: response.data.results[0], secondItem: response.data.results[1] })

                setMoviesLength(response.data.results.length)
                setLoading(false)

            })
            .catch(function (error) {
                console.error(error);
            });
    };

    const handleVote = (order) => {
        setSelectedMovie(order)

        if (order == 'first') {
            const secondItem = displayMovies.secondItem
            const firstItem = displayMovies.firstItem

            let temp = [...movies]

            temp.splice(temp.findIndex(i => i.id == secondItem.id), 1)
            setMovies([...temp])
            firstItem.vote_count += 1;

            setVotedMovies([firstItem, ...votedMovies])

            setDisplayMovies({
                firstItem: displayMovies.firstItem,
                secondItem: ""
            })

            // const nextMovie = 

            setTimeout(() => {
                setDisplayMovies({ firstItem: displayMovies.firstItem, secondItem: movies[1] })
            }, 1000)

        } else if (order == 'second') {
            const secondItem = displayMovies.secondItem
            const firstItem = displayMovies.firstItem

            let temp = [...movies]
            temp.splice(temp.findIndex(i => i.id == firstItem.id), 1)

            setMovies([...temp])
            secondItem.vote_count += 1;
            setVotedMovies([secondItem, ...votedMovies])

            setDisplayMovies({
                firstItem: "",
                secondItem: displayMovies.secondItem
            })

            setTimeout(() => {
                setDisplayMovies({ firstItem: movies[0], secondItem: displayMovies.secondItem })
            }, 1000)
        }
    }

    console.log(movies, 'mv', votedMovies, "vm")


    if (loading) {
        return <div className={styles.loader}>
            <Spinner />
        </div>
    }
    else {
        return (<div className={styles.QuizPage}>
            <div className="container">
                {moviesLength > 1 ? (

                    <div className={styles.quizBox}>
                        {movies.length > 1 && !isFinished && (
                            <>
                                <div className={styles.quizItem} style={{ opacity: displayMovies.firstItem == "" ? '0' : 1 }} >
                                    <h3>{displayMovies.firstItem.title}(#{displayMovies.firstItem.vote_count})</h3>
                                    <img src={displayMovies.firstItem.poster_path ? BaseImageUrl + displayMovies.firstItem.poster_path : '/empty.png'} alt="" />
                                    {selectedMovie == 'first' ? (
                                        <Button colorScheme="blue">VOTED</Button>

                                    ) : (

                                        <Button colorScheme="blue" onClick={() => handleVote('first')}>VOTE</Button>
                                    )}
                                </div>


                                <div className={styles.quizItem} style={{ opacity: displayMovies.secondItem == "" ? '0' : 1 }}>
                                    <h3>{displayMovies.secondItem.title}(#{displayMovies.secondItem.vote_count})</h3>
                                    <img src={displayMovies.secondItem.poster_path ? BaseImageUrl + displayMovies.secondItem.poster_path : '/empty.png'} alt="" />
                                    {selectedMovie == 'second' ? (
                                        <Button colorScheme="blue" >VOTED</Button>
                                    ) : (

                                        <Button colorScheme="blue" onClick={() => handleVote('second')}>VOTE</Button>
                                    )}
                                </div>
                            </>
                        )}


                    </div>
                ) : (
                    <h2>No data found, Please select different genres or languages to continue. </h2>
                )}
                <div className={styles.nav}>

                    {moviesLength > 1 && !isFinished && (

                        <Button variant="outline" colorScheme="blue" onClick={() => setFinished(true)}>Finish</Button>
                    )}
                </div>

                {isFinished && (

                    <div className={styles.leaderboard}>
                        <h2>Leaderboard</h2>
                        {votedMovies.sort(function (a, b) {
                            return a.vote_count - b.vote_count;
                        }).map((i, index) => (

                            <div className={styles.movieItem} key={index}>
                                <img src={i.poster_path ? BaseImageUrl + i.poster_path : '/empty.png'} alt="" />
                                <h3><span>{i.title}</span><br />Rank #{i.vote_count}</h3>
                            </div>
                        ))}
                    </div>
                )}

            </div>
        </div>
        )
    }

}

export default Movies;
