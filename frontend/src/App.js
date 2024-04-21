import logo from './logo.svg';
import './App.css';
import Page from './Page';
import NavBar from './NavBar';
import { CssBaseline, CssVarsProvider, extendTheme } from '@mui/joy';

const purple = {
	50: '#FDF7FF',
	100: '#F4EAFF',
	200: '#E1CBFF',
	300: '#C69EFF',
	400: '#A374F9',
	500: '#814DDE',
	600: '#5F35AE',
	700: '#452382',
	800: '#301761',
	900: '#1D0A42',
};

// const theme = extendTheme({})
const theme = extendTheme({
	colorSchemes: {
		light: {
			palette: {
				secondary: {
					50: '#FDF7FF',
					100: '#F4EAFF',
					200: '#E1CBFF',
					300: '#C69EFF',
					400: '#A374F9',
					500: '#814DDE',
					600: '#5F35AE',
					700: '#452382',
					800: '#301761',
					900: '#1D0A42',
					outlinedActiveBg: "var(--joy-palette-secondary-200)",
					outlinedBorder: "var(--joy-palette-secondary-300)",
					outlinedColor: "var(--joy-palette-secondary-500)",
					outlinedDisabledBorder: "var(--joy-palette-secondary-200)",
					outlinedDisabledColor: "var(--joy-palette-secondary-400)",
					outlinedHoverBg: "var(--joy-palette-secondary-100)",
					plainActiveBg: "var(--joy-palette-secondary-100)",
					plainColor: "var(--joy-palette-secondary-500)",
					plainDisabledColor: "var(--joy-palette-secondary-400)",
					plainHoverBg: "var(--joy-palette-secondary-50)",
					softActiveBg: "var(--joy-palette-secondary-300)",
					softActiveColor: "var(--joy-palette-secondary-800)",
					softBg: "var(--joy-palette-secondary-100)",
					softColor: "var(--joy-palette-secondary-700)",
					softDisabledBg: "var(--joy-palette-secondary-50)",
					softDisabledColor: "var(--joy-palette-secondary-400)",
					softHoverBg: "var(--joy-palette-secondary-200)",
					solidActiveBg: "var(--joy-palette-secondary-700)",
					solidBg: "var(--joy-palette-secondary-500)",
					solidColor: "var(--joy-palette-common-white)",
					solidDisabledBg: "var(--joy-palette-secondary-100)",
					solidDisabledColor: "var(--joy-palette-secondary-400)",
					solidHoverBg: "var(--joy-palette-secondary-600)",
				},
				danger: {
					plainActiveBg: "var(--joy-palette-danger-100)",
					plainHoverBg: "var(--joy-palette-danger-50)",
				},
				success: {
					plainActiveBg: "var(--joy-palette-success-100)",
					plainHoverBg: "var(--joy-palette-success-50)",
				}
			}
		}
	}
})

console.log(theme.colorSchemes.light.palette.primary)

function App() {
	return (
		<div className="App">
			<CssVarsProvider theme={theme}>
				<CssBaseline />
				<NavBar />
				<Page />
			</CssVarsProvider>
		</div>
	);
}

export default App;
