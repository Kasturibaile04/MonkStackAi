import {useContext,useEffect} from "react";
import {AuthContext} from "../auth.context.jsx";
import {register,login,logout,getMe} from "../services/auth.api.js";

export const useAuth = () => {
    const context = useContext(AuthContext);
    const {user,setUser,loading,setLoading} = context;


    const handleLogin = async({email,password}) => {
        try{
            setLoading(true);
            const response = await login({email,password});
            setUser(response.user);
            return response;
        }catch(error){
            console.log(error);
            throw error;
        }finally{
            setLoading(false);
        }
    };

    const handleRegister = async({username,email,password}) => {
        try{
            setLoading(true);
            const response = await register({username,email,password});
            setUser(response.user);
            return response;
        }catch(error){
            console.log(error);
            throw error;
        }finally{
            setLoading(false);
        }
    };

    const handleLogout = async() => {
        try{
            setLoading(true);
            const response = await logout();
            setUser(null);
            return response;
        }catch(error){
            console.log(error);
            throw error;
        }finally{
            setLoading(false);
        }
    };

    useEffect(() => {
        const fetchUser = async () => {
            setLoading(true);
            try {
                const response = await getMe();
                setUser(response.user);
            } catch (error) {
                setUser(null)
            } finally {
                setLoading(false);
            }
        };
        fetchUser();
    }, []);

    

    return {
        user,
        setUser,
        loading,
        setLoading,
        handleLogin,
        handleRegister,
        handleLogout
    };
}

