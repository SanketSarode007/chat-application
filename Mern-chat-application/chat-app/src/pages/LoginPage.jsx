import { useContext } from "react";
import assets from "../assets/assets"
import { useState } from "react";
import { AuthContext } from "../../Context/AuthContext";
export const LoginPage = () => {

  const [currState, setCurrState] = useState('Sign up');
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [bio, setBio] = useState('');
  const [isDataSubmitted, setIsDataSubmitted] = useState(false);

  const {login} = useContext(AuthContext)

  function handleFormSubmit(event){
    event.preventDefault();

    if(currState === 'Sign up' && !isDataSubmitted){
      setIsDataSubmitted(true);
      return ;
    }

    login(currState === 'Sign up' ? 'signup' : 'login', {fullName, email, password, bio}) 
  }

    return(
        <div className="min-h-screen bg-cover bg-center flex items-center justify-around gap-8 
        max-sm:flex-col backdrop-blur-2xl">
          {/* Left  */}
          <img src={assets.logo_big} alt=""  className="w-50" />

          {/* right */}
          <form onSubmit={handleFormSubmit} className="border-2 bg-white/8 text-white borde-gray-500 p-6 flex flex-col  gap-6 rounded-lg shadow-lg">
          <h2 className="font-medium text-2xl flex justify-between items-center">
            {currState}
            {isDataSubmitted && <img onClick={() => setIsDataSubmitted(false)} src={assets.arrow_icon} alt="" className="w-5 cursor-pointer" />}
           
            </h2>
            {
              currState === 'Sign up' && !isDataSubmitted &&
             <input onChange={(e) =>  setFullName(e.target.value)} value={fullName}  type="text" className="p-2 border border-gray-500 rounded-md focus:outline-none" placeholder="Full Name" required />
            }
            {
              !isDataSubmitted && (
                <>
                  <input onChange={(e) =>  setEmail(e.target.value)} value={email} type="email" className="p-2 border border-gray-500 rounded-md focus:ring-2 focus:ring-indigo-500" placeholder="Email Address" required />
                  <input onChange={(e) =>  setPassword(e.target.value)} value={password} type="password" className="p-2 border border-gray-500 rounded-md focus:ring-2 focus:ring-indigo-500" placeholder="Password" required />
                </>
              )
            }
            {
              currState === 'Sign up' && isDataSubmitted && (
                <textarea onChange={(e) => setBio(e.target.value)} value={bio} rows={4} className="p-2 border border-gray-500 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                placeholder="Provid a short bio..." required></textarea>
              )
            }
            <button className="py-3 bg-gradient-to-r from-purple-400 
             to-violet-600 text-white border-none text-sm font-light py-2 px-20 rounded-full cursor-pointer">{currState === 'Sign up' ? 'Create Account' : 'Login Now'}</button>

             <div className="flex items-center gap-2 text-sm text-gray-500">
              <input type="checkbox" />
              <p>Agree to the terms of use and privacy policy</p>
             </div>

             <div>
              {currState === 'Sign up' ? (
                <p className="text-sm text-gray-600">Already have an account? 
                <span onClick={() => {setCurrState('Login'); setIsDataSubmitted(false)}} className="px-2 font-medium text-violet-500 cursor-pointer">Login here</span>
                </p>
              ) : (
                <p className="text-sm text-gray-600">Create an account 
                <span onClick={() => {setCurrState('Sign up'); setIsDataSubmitted(true)}} className="px-2 font-medium text-violet-500 cursor-pointer">Click here</span>
                </p>
              ) }
             </div>
          </form>
        </div>
    )
}