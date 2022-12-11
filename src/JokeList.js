import React, { useState ,useEffect } from "react";
import axios from "axios";
import Joke from "./Joke";
import "./JokeList.css";

/** List of jokes. */

function JokeList({ numJokesToGet = 5 }) {

  const initialStorageJokes = JSON.parse(window.localStorage.getItem("jokes")) || [];

  const [jokes, setJokes] = useState(initialStorageJokes);

  const [isLoading, setIsLoading] = useState(false);

  // Get Jokes from the API whenever there is a change in the jokes STATE and numJokesToGet and also update the localstorage
  useEffect(() => {

    /* retrieve jokes from API */
    async function getJokes() {
      try {
        // load jokes one at a time, adding not-yet-seen jokes
        let j = [...jokes];
        let seenJokes = new Set();

        while (j.length < numJokesToGet) {
          let res = await axios.get("https://icanhazdadjoke.com", {
            headers: { Accept: "application/json" }
          });

          // This "joke" object contains the properties "id, joke, status"
          let { ...joke } = res.data;

          if (!seenJokes.has(joke.id)) {
            seenJokes.add(joke.id);
            j.push({ ...joke, votes: 0 });
          } else {
            console.log("duplicate found!");
          }
        }

        setJokes(j);
        setIsLoading(false);
        

      } catch (err) {
        console.error(err);
      }
    }

    // Setting the localstorage with the new jokes 
    window.localStorage.setItem("jokes", JSON.stringify(jokes));

    if (jokes.length === 0) getJokes();
    
  }, [jokes, numJokesToGet]);

  /* empty joke list, set to loading state*/
  function generateNewJokes() {
    setIsLoading(isLoading => !isLoading);
    setJokes([]);
  }

  /* change votes of the particular joke for this id by delta (+1 or -1) */
  function vote(id, delta) {
    let newJokes = jokes.map(j => (j.id === id ? { ...j, votes: j.votes + delta } : j));
    setJokes(newJokes);
  }

  // To reset the votes of the particular joke for this id when the reset button is clicked
  function reset(id) {
    let newJokes = jokes.map(j => (j.id === id ? { ...j, votes: 0 } : j)); 
    setJokes(newJokes);
  }

  // Sorting the list of jokes based on vote 
  let sortedJokes = [...jokes].sort((a, b) => b.votes - a.votes);

  // If the isLoading is true then load the spinner on dom
  if (isLoading) {
    return (
      <div className="loading">
        <i className="fas fa-4x fa-spinner fa-spin" />
      </div>
    )
  }

  return (
    <div className="JokeList">
      <button
        className="JokeList-getmore"
        onClick={generateNewJokes}
      >
        Get New Jokes
      </button>

      {sortedJokes.map(j => (
        <Joke
          text={j.joke}
          key={j.id}
          id={j.id}
          votes={j.votes}
          vote={vote}
          reset={reset}
        />
      ))}

    </div>
  );

}

// class JokeList extends Component {
//   static defaultProps = {
//     numJokesToGet: 5
//   };

//   constructor(props) {
//     super(props);
//     this.state = {
//       jokes: [],
//       isLoading: true
//     };

//     this.generateNewJokes = this.generateNewJokes.bind(this);
//     this.vote = this.vote.bind(this);
//   }

//   /* at mount, get jokes */

//   componentDidMount() {
//     this.getJokes();
//   }

//   /* retrieve jokes from API */

//   async getJokes() {
//     try {
//       // load jokes one at a time, adding not-yet-seen jokes
//       let jokes = [];
//       let seenJokes = new Set();

//       while (jokes.length < this.props.numJokesToGet) {
//         let res = await axios.get("https://icanhazdadjoke.com", {
//           headers: { Accept: "application/json" }
//         });
//         let { ...joke } = res.data;

//         if (!seenJokes.has(joke.id)) {
//           seenJokes.add(joke.id);
//           jokes.push({ ...joke, votes: 0 });
//         } else {
//           console.log("duplicate found!");
//         }
//       }

//       this.setState({ jokes, isLoading: false });
//     } catch (err) {
//       console.error(err);
//     }
//   }

//   /* empty joke list, set to loading state, and then call getJokes */

//   generateNewJokes() {
//     this.setState({ isLoading: true});
//     this.getJokes();
//   }

//   /* change vote for this id by delta (+1 or -1) */

//   vote(id, delta) {
//     this.setState(st => ({
//       jokes: st.jokes.map(j =>
//         j.id === id ? { ...j, votes: j.votes + delta } : j
//       )
//     }));
//   }

//   /* render: either loading spinner or list of sorted jokes. */

//   render() {
//     let sortedJokes = [...this.state.jokes].sort((a, b) => b.votes - a.votes);
//     if (this.state.isLoading) {
//       return (
//         <div className="loading">
//           <i className="fas fa-4x fa-spinner fa-spin" />
//         </div>
//       )
//     }

//     return (
//       <div className="JokeList">
//         <button
//           className="JokeList-getmore"
//           onClick={this.generateNewJokes}
//         >
//           Get New Jokes
//         </button>

//         {sortedJokes.map(j => (
//           <Joke
//             text={j.joke}
//             key={j.id}
//             id={j.id}
//             votes={j.votes}
//             vote={this.vote}
//           />
//         ))}
//       </div>
//     );
//   }
// }

export default JokeList;
