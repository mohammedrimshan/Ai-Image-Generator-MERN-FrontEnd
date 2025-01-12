import { motion } from 'framer-motion';
import { Button } from '../components/ui/button';
import { Link } from 'react-router-dom';

const Home = () => {
  return (
    <div className="min-h-screen flex flex-col justify-center items-center p-4">
      <motion.h1 
        className="text-4xl md:text-6xl font-bold text-center mb-6"
        initial={{ opacity: 0, y: -50 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        Welcome to AI Image Generator
      </motion.h1>
      <motion.p 
        className="text-xl text-center mb-8 max-w-2xl"
        initial={{ opacity: 0, y: 50 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.2 }}
      >
        Create stunning images with the power of AI. Let your imagination run wild!
      </motion.p>
      <motion.div
        initial={{ opacity: 0, scale: 0.5 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5, delay: 0.4 }}
      >
        <Link to="/generate">
          <Button size="lg" className="text-lg">
            Start Generating
          </Button>
        </Link>
      </motion.div>
    </div>
  );
};

export default Home;

