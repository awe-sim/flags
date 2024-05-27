// import { useState } from 'react';
// import reactLogo from './assets/react.svg';
// import viteLogo from '/vite.svg';
// import { COUNTRIES } from './countries';
// import { uniq } from 'lodash';
// import './App.css';

import { atom, useRecoilState, useRecoilValue } from 'recoil';
import { Continent, COUNTRIES, Country, Tag } from './countries';
import { recoilPersist } from 'recoil-persist';
import { Card, CardMedia, FormControl, FormControlLabel, Grid, InputLabel, MenuItem, Select, Stack, Switch, Typography } from '@mui/material';
import { useCallback, useMemo, useState } from 'react';
import { uniq } from 'lodash';

const { persistAtom } = recoilPersist();

const colorState = atom<boolean>({
  key: 'colorState',
  default: true,
  effects_UNSTABLE: [persistAtom],
});

const itemsPerRowState = atom<number>({
  key: 'itemsPerRowState',
  default: 4,
  effects_UNSTABLE: [persistAtom],
});

const continentState = atom<Continent | undefined>({
  key: 'continentState',
  default: undefined,
  // effects_UNSTABLE: [persistAtom],
});

const countriesState = atom<Country[]>({
  key: 'countriesState',
  default: COUNTRIES,
  // effects_UNSTABLE: [persistAtom],
});

export function useCountries(countryCode: string) {
  //
  const [countries, setCountries] = useRecoilState(countriesState);

  const hideCountry = useCallback(() => {
    setCountries((countries) => countries.map((c) => (c.code === countryCode ? { ...c, hidden: true } : c)));
  }, [countryCode, setCountries]);

  const updateCountry = useCallback(
    (country: Country) => {
      setCountries(countries.map((c) => (c.code === countryCode ? country : c)));
    },
    [countries, countryCode, setCountries]
  );

  const setTags = useCallback(
    (tags: Tag[]) => {
      setCountries(countries.map((c) => (c.code === countryCode ? { ...c, tags } : c)));
    },
    [countries, countryCode, setCountries]
  );

  const addTag = useCallback(
    (tag: Tag) => {
      setCountries(countries.map((c) => (c.code === countryCode ? { ...c, tags: uniq([...c.tags, tag]) } : c)));
    },
    [countries, countryCode, setCountries]
  );

  const removeTag = useCallback(
    (tag: Tag) => {
      setCountries(countries.map((c) => (c.code === countryCode ? { ...c, tags: c.tags.filter((t) => t !== tag) } : c)));
    },
    [countries, countryCode, setCountries]
  );

  return { countries, hideCountry, updateCountry, setTags, addTag, removeTag };
}

const CONTINENTS: Continent[] = [Continent.EUROPE, Continent.ASIA, Continent.NORTH_AMERICA, Continent.SOUTH_AMERICA, Continent.AFRICA, Continent.OCEANIA, Continent.ANTARCTICA, Continent.NONE];

export const App: React.FC = () => {
  const [showColors, setShowColors] = useRecoilState(colorState);
  const [itemsPerRow, setItemsPerRow] = useRecoilState(itemsPerRowState);
  const continent = useRecoilValue(continentState);
  const filteredContinents = useMemo(() => (continent ? [continent] : CONTINENTS), [continent]);

  return (
    <Stack direction="column" spacing={2}>
      <Stack direction="row" spacing={2}>
        <h1>Flags</h1>
        <FormControlLabel control={<Switch checked={showColors} onChange={(_ev, value) => setShowColors(value)} />} label="Show Colors" />
        <FormControl style={{ width: 100 }}>
          <InputLabel id="demo-simple-select-label">Flags per row</InputLabel>
          <Select labelId="demo-simple-select-label" id="demo-simple-select" variant="standard" size="small" value={itemsPerRow} label="Age" onChange={(ev) => setItemsPerRow(+ev.target.value)}>
            <MenuItem value={24}>24</MenuItem>
            <MenuItem value={12}>12</MenuItem>
            <MenuItem value={8}>8</MenuItem>
            <MenuItem value={6}>6</MenuItem>
            <MenuItem value={5}>5</MenuItem>
            <MenuItem value={4}>4</MenuItem>
            <MenuItem value={3}>3</MenuItem>
            <MenuItem value={2}>2</MenuItem>
            <MenuItem value={1}>1</MenuItem>
          </Select>
        </FormControl>
      </Stack>
      {filteredContinents.map((continent) => (
        <ContinentComponent continent={continent} key={continent} />
      ))}
    </Stack>
  );
};

type ContinentProps = {
  continent: Continent;
};
const ContinentComponent: React.FC<ContinentProps> = ({ continent }) => {
  const itemsPerRow = useRecoilValue(itemsPerRowState);
  const countries = useRecoilValue(countriesState);
  const filteredCountries = useMemo(() => countries.filter((country) => continent === country.continent), [continent, countries]);
  return (
    <>
      <h2>{continent}</h2>
      <Grid container spacing={2}>
        {filteredCountries.map((country) => (
          <Grid xs={12 / itemsPerRow} item key={country.code}>
            <CountryComponent country={country} />
            <Typography>{country.name}</Typography>
          </Grid>
        ))}
      </Grid>
    </>
  );
};

type CountryProps = {
  country: Country;
};
const CountryComponent: React.FC<CountryProps> = ({ country }) => {
  const showColors = useRecoilValue(colorState);
  // const { updateCountry, setTags } = useCountries(country.code);
  const [hover, setHover] = useState(false);
  const onMouseEnter = () => setHover(true);
  const onMouseLeave = () => setHover(false);
  const url = (() => {
    if (showColors || hover) return `${country.pngImage}`;
    return `${country.pngOutline}`;
  })();
  return (
    <Card variant="outlined" onMouseEnter={showColors ? undefined : onMouseEnter} onMouseLeave={showColors ? undefined : onMouseLeave}>
      <CardMedia component="img" image={url}></CardMedia>
    </Card>
  );
};
