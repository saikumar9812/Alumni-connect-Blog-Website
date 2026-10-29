
import { Grid } from '@mui/material';

//components
import Banner from '../banner/Banner';
import Categories from './Categories';
import Filters from './Filters';
import Posts from './post/Posts';

const Home = () => {

    return (
        <>
            <Banner />
            <Grid container>
                <Grid item lg={2} xs={12} sm={2}>
                    <Categories />
                </Grid>
                <Grid item xs={12} sm={10} lg={10}>
                    <Filters />
                    <Grid container>
                        <Posts />
                    </Grid>
                </Grid>
            </Grid>
        </>
    )
}

export default Home;