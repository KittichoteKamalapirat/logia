import { BrowserRouter, Route, Routes } from "react-router-dom";
import Home from "./pages/home";
import Login from "./pages/login";
import Register from "./pages/register";
import CreateUploadPage from "./pages/create-upload";

function App() {
  return (
    <div className="App">
      <BrowserRouter>
        <Routes>
          <Route index path="/" element={<Home />} />
          <Route path="/register" element={<Register />} />
          <Route path="/login" element={<Login />} />
          <Route path="/create-upload" element={<CreateUploadPage />} />
          {/* <Route index element={<Home />} /> */}
          {/* <Route path="teams" element={<Teams />}>
          <Route path=":teamId" element={<Team />} />
          <Route path="new" element={<NewTeamForm />} />
          <Route index element={<LeagueStandings />} /> */}
          {/* </Route> */}
        </Routes>
      </BrowserRouter>
    </div>
  );
}

export default App;
