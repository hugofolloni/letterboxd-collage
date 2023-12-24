import { useState } from "react"
import axios from 'axios';
import cheerio from 'cheerio';

const Analysis = () => {
    const [posterList, setPosterList] = useState([])
    const [username, setUsername] = useState('')
    const [year, setYear] = useState(2023)

    const scrappy = async (user, year, page) => {

        var texts = []
        var years = []
        const proxy = 'https://thingproxy.freeboard.io/fetch/'
        const pageUrl = `https://letterboxd.com/${user}/films/diary/for/${year}`

        const myURL = `${proxy}${pageUrl}`
        const { data } = await axios.get(myURL);
        const $ = cheerio.load(data);

        const entries_text = $(".ui-block-heading");
        const film_number = Number((entries_text.html()).split('logged')[1].split('&')[0])
        console.log(film_number)
        const pages = Math.ceil(film_number / 50)

        while(texts.length < film_number){

            $('.headline-3 > a').each((_idx, el) => {
                const bodyPart = $(el).text()
                texts.push(bodyPart)
            });

            $(".td-released > span").each((_idx, el) => {
                const bodyPart = $(el).text()
                years.push(bodyPart)
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
                    
                    $(".td-released > span").each((_idx, el) => {
                        const bodyPart = $(el).text()
                        years.push(bodyPart)
                    });
                }
            }
        }

        console.log(texts)
        return [texts, years]
    }

    const getPosters = (texts, years) => {
        var posters = []
        console.log(texts.length)
       
        for(let i = 0; i < texts.length; i++){
            console.log(i)
            const url = `https://api.themoviedb.org/3/search/movie?query=${texts[i]}&year=${years[i]}&include_adult=false&language=en-US&page=1`;
            
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
                        console.log(json.results[0].poster_path)
                        posters.push(`https://image.tmdb.org/t/p/w92${json.results[0].poster_path}`)
                    }}
                }
                )
            .catch(err => console.error('error:' + err));
        }

        return posters

    }


    const getCollage = async (username, year, page) => {
        var texts = await scrappy(username, year, page)
        var movies = getPosters(texts[0], texts[1])
        setTimeout(() => {
            const possible_lenghts = [7, 6, 5, 8, 9, 11, 13]
            var poster_row = 7
            for(let i = 0; i < possible_lenghts.length; i++){
                if(movies.length % possible_lenghts[i] === 0){
                    poster_row = possible_lenghts
                    break
                }
            }
            console.log(poster_row)
            setPosterList(movies)
        }, 4000)
    }
    

    return ( 
        <div>
            <input type="text" placeholder="Usuário" onChange={(e) => setUsername(e.target.value)} value={username} />
            <button onClick={() => getCollage(username, year, 1)}>Buscar</button>
            <br></br>
            {
                posterList.reverse().map(poster => (<img src={poster} alt=''/>))
            }
        </div>
        );

}
 
export default Analysis;