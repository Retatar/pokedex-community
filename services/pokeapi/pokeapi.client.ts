import axios from 'axios';
import { POKEAPI_BASE_URL } from '../../constants/config';

const pokeApiClient = axios.create({
  baseURL: POKEAPI_BASE_URL,
  timeout: 15000,
  headers: {
    'Content-Type': 'application/json',
  },
});

export default pokeApiClient;
