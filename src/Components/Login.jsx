import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";

import { signInWithEmailAndPassword } from "firebase/auth";
import { auth } from "../firebaseConfig";
import { doc, getDoc } from "firebase/firestore";
import { db } from "../firebaseConfig";

const Login = ({ setLoggedIn }) => {
  const navigate = useNavigate();
  const [user, setUser] = useState({ email: "", password: "" });

  function handleChange(event) {
    setUser({ ...user, [event.target.id]: event.target.value });
  }
  // This function is being used in two places. It can be extracted to a helpers.js file
  async function firebaseSignIn(emailPass) {
    try {
      const userCredential = await signInWithEmailAndPassword(
        auth,
        emailPass.email,
        emailPass.password
      );
      const loggedUser = userCredential.user;

      if (loggedUser) {
        const docRef = doc(db, "users", loggedUser.uid);
        const docSnap = await getDoc(docRef);
        await setLoggedIn(true);

        if (docSnap.exists()) {
          loggedUser.username = docSnap.data().username;
        }
        // Store user in localStorage
        localStorage.setItem(
          "user",
          JSON.stringify({
            id: loggedUser.uid,
            email: loggedUser.email,
            lastSignIn: loggedUser.metadata.lastSignInTime,
            username: loggedUser.username,
          })
        );
        navigate("/dashboard"); // Adjust the route as necessary to go to the view you want
      }
    } catch (error) {
      console.error("Login error:", error);
      alert("Failed to log in");
      setLoggedIn(false);
      setUser({ email: "", password: "" });
    }
  }

  // Login Function
  function handleSubmit(e) {
    e.preventDefault();
    firebaseSignIn({ email: user.email, password: user.password });
  }

  //Demo User Login Function
  function handleDemoSignIn(e) {
    e.preventDefault();
    firebaseSignIn({ email: "demo@me.com", password: "password" });
  }

  // BUILD OUT YOUR FORM PROPERLY WITH LABELS AND WHATEVER CSS FRAMEWORK YOU MAY USE OR VANILLA CSS. THIS IS JUST A BOILERPLATE

  return (
    <div>
      <h2>Use the DemoUser button to login and save time during demo</h2>
      <h3> Remove the 'br' tags and these instructions if you use this code</h3>
      <button onClick={handleDemoSignIn}>Demo User</button>
      <br />
      <br />
      <br />
      <h4>Login</h4>
      <form onSubmit={handleSubmit}>
        <label htmlFor="email">
          <input
            id="email"
            value={user.email}
            type="email"
            placeholder="email"
            autoComplete="email"
            onChange={handleChange}
            required
          />
        </label>
        <br />
        <label htmlFor="password">
          <input
            id="password"
            value={user.password}
            type="password"
            placeholder="password"
            onChange={handleChange}
            autoComplete="current-password"
            required
          />
        </label>
        <br />
        <button>Submit</button>
      </form>
      <p>
        No Account? <Link to="/register">Register</Link>
      </p>
    </div>
  );
};

export default Login;
