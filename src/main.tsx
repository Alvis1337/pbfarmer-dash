import ReactDOM from "react-dom/client";
import App from "./App.tsx";
import "./index.css";
import '@fontsource/roboto/300.css';
import '@fontsource/roboto/400.css';
import '@fontsource/roboto/500.css';
import '@fontsource/roboto/700.css';
import {createTheme, ThemeProvider} from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import React from 'react'
import {MinerProvider} from "./pages/MinerContext.tsx";

const darkTheme = createTheme({
    palette: {
        mode: 'dark',
    },
});

ReactDOM.createRoot(document.getElementById("root") as HTMLElement).render(
    <ThemeProvider theme={darkTheme}>
        <CssBaseline/>
        <MinerProvider>
            <App/>
        </MinerProvider>
    </ThemeProvider>
);
