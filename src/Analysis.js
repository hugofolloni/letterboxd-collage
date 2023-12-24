import { useState, useEffect } from "react"
import axios from 'axios';
import cheerio, { text } from 'cheerio';

const Analysis = () => {
    const [textList, setTextList] = useState([])
    const [posterList, setPosterList] = useState([])
    const [username, setUsername] = useState('')
    const [year, setYear] = useState(2023)

    const scrappy = async (user, year, page) => {

        var texts = []
        const proxy = 'https://thingproxy.freeboard.io/fetch/'
        const pageUrl = `https://letterboxd.com/${user}/films/diary/for/${year}`

        const myURL = `${proxy}${pageUrl}`
        const { data } = await axios.get(myURL);
        const $ = cheerio.load(data);

        const entries_text = $(".ui-block-heading");
        const film_number = Number((entries_text.html()).split('logged')[1].split('&')[0])
        console.log(film_number)
        const pages = Math.ceil(film_number / 50)

        $('.headline-3 > a').each((_idx, el) => {
            const bodyPart = $(el).text()
            texts.push(bodyPart)
        });

        if(pages > 1){
            for(let i = 2; i < pages + 1; i++){
    
                const proxy = 'https://thingproxy.freeboard.io/fetch/'
                const { data } = await axios.get(`${proxy}https://letterboxd.com/${user}/films/diary/for/${year}/page/${i}`);
                const $ = cheerio.load(data);

                $('.headline-3 > a').each((_idx, el) => {
                    const bodyPart = $(el).text()
                    texts.push(bodyPart)
                });
            }
        }

        setTextList(texts)
        console.log(textList)

        var posters = []
       
        
        for(let i = 0; i < texts.length; i++){
            const url = `https://api.themoviedb.org/3/search/movie?query=${texts[i]}&include_adult=false&language=en-US&page=1`;
            
            const options = {
                method: 'GET',
                headers: {
                    accept: 'application/json',
                    Authorization: 'Bearer eyJhbGciOiJIUzI1NiJ9.eyJhdWQiOiI4NWZiNTMxNTllNTQ5MzM5MWM2ZmJmODdhNzMzY2ZlYiIsInN1YiI6IjYzZmE4OGQ0MjVhNTM2MDA4NzRkMTI4NCIsInNjb3BlcyI6WyJhcGlfcmVhZCJdLCJ2ZXJzaW9uIjoxfQ.ZXCuFf1SMq5uirGr88aJqmoUfRSKth8Y4XVYhoUdY1w'
                }
            };

            fetch(url, options)
            .then(res => res.json())
            .then(json => {
                if(json.results.length > 0){
                    if(json.results[0].poster_path !== undefined){
                        posters.push({source: 'https://image.tmdb.org/t/p/w92' + json.results[0].poster_path})
                    }}
                }
                )
            .catch(err => console.error('error:' + err));
        }


        setPosterList(posters.reverse())
        console.log(posterList)
    }

    return ( 
        <div>
            <input type="text" placeholder="Usuário" onChange={(e) => setUsername(e.target.value)} value={username} />
            <button onClick={() => scrappy(username, year, 1)}>Buscar</button>
            {
                posterList.map(poster => (<img src={poster.source} alt=''/>))
            }
            {
                posterList.map(poster => <p>{poster.source}</p>)
            }

        </div>
        );

}
 
export default Analysis;