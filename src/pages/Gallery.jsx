import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'react-hot-toast';
import { Button } from '../components/ui/button';
import { Card, CardContent, CardFooter } from '../components/ui/card';
import { Loader2, Download, X } from 'lucide-react';

const Gallery = () => {
  const [images, setImages] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isDeleting, setIsDeleting] = useState(null);
  const [selectedImage, setSelectedImage] = useState(null);
  const [isDownloading, setIsDownloading] = useState(null);

  useEffect(() => {
    fetchImages();
  }, []);

  const fetchImages = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await fetch('http://localhost:3008/images/user-images', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      const result = await response.json();
      
      if (response.ok && result.success) {
        setImages(Array.isArray(result.data) ? result.data : []);
      } else {
        const errorMessage = result.message || 'Failed to fetch images';
        setError(errorMessage);
        toast.error(errorMessage);
      }
    } catch (error) {
      console.error('Fetch error:', error);
      const errorMessage = 'An error occurred while fetching images';
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async (id) => {
    setIsDeleting(id);
    try {
      const response = await fetch(`http://localhost:3008/images/${id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      
      const result = await response.json();
      
      if (response.ok && result.success) {
        setImages(images.filter(image => image._id !== id));
        toast.success('Image deleted successfully');
      } else {
        toast.error(result.message || 'Failed to delete image');
      }
    } catch (error) {
      console.error('Delete error:', error);
      toast.error('An error occurred while deleting the image');
    } finally {
      setIsDeleting(null);
    }
  };

  const handleDownload = async (imageUrl, prompt, imageId) => {
    setIsDownloading(imageId);
    try {
      const response = await fetch(imageUrl);
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `${prompt.slice(0, 30)}.png`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
      toast.success('Image download started');
    } catch (error) {
      console.error('Download error:', error);
      toast.error('Failed to download image');
    } finally {
      setIsDownloading(null);
    }
  };

  if (isLoading) {
    return (
      <div className="container mx-auto p-4 flex justify-center items-center min-h-[200px]">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto p-4 flex flex-col justify-center items-center min-h-[200px] gap-4">
        <div className="text-lg text-red-500">{error}</div>
        <Button onClick={fetchImages}>Retry</Button>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-4">
      <motion.div 
        className="flex justify-between items-center mb-6"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <h1 className="text-3xl font-bold">Your Gallery</h1>
        <Button onClick={fetchImages}>Refresh</Button>
      </motion.div>

      {images.length === 0 ? (
        <div className="text-center text-gray-500 mt-8">
          No images found. Start by creating some!
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {images.map((image, index) => (
            <motion.div
              key={image._id}
              initial={{ opacity: 0, scale: 0.5 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
            >
              <Card className="overflow-hidden">
                <CardContent className="p-4">
                  <div 
                    className="relative w-full h-48 cursor-pointer"
                    onClick={() => setSelectedImage(image)}
                  >
                    <img 
                      src={image.imageUrl} 
                      alt={image.prompt}
                      className="w-full h-full object-cover rounded-lg transition-transform hover:scale-105"
                      onError={(e) => {
                        console.error('Image failed to load:', image.imageUrl);
                        e.target.src = '/placeholder-image.jpg';
                        toast.error(`Failed to load image: ${image.prompt}`);
                      }}
                    />
                  </div>
                </CardContent>
                <CardFooter className="flex justify-between items-center p-4">
                  <p className="text-sm text-muted-foreground truncate max-w-[50%]" title={image.prompt}>
                    {image.prompt}
                  </p>
                  <div className="flex gap-2">
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => handleDownload(image.imageUrl, image.prompt, image._id)}
                      disabled={isDownloading === image._id}
                    >
                      {isDownloading === image._id ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        <Download className="h-4 w-4" />
                      )}
                    </Button>
                    <Button 
                      variant="destructive" 
                      size="sm" 
                      onClick={() => handleDelete(image._id)}
                      disabled={isDeleting === image._id}
                    >
                      {isDeleting === image._id ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        'Delete'
                      )}
                    </Button>
                  </div>
                </CardFooter>
              </Card>
            </motion.div>
          ))}
        </div>
      )}

      <AnimatePresence>
        {selectedImage && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
            onClick={() => setSelectedImage(null)}
          >
            <motion.div
              initial={{ scale: 0.5 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0.5 }}
              className="bg-white dark:bg-gray-800 rounded-lg max-w-4xl w-full max-h-[90vh] overflow-hidden"
              onClick={e => e.stopPropagation()}
            >
              <div className="relative">
                <Button
                  variant="ghost"
                  size="icon"
                  className="absolute right-2 top-2 z-10"
                  onClick={() => setSelectedImage(null)}
                >
                  <X className="h-4 w-4" />
                </Button>
                <img 
                  src={selectedImage.imageUrl} 
                  alt={selectedImage.prompt}
                  className="w-full h-auto"
                />
                <div className="absolute bottom-4 right-4">
                  <Button
                    onClick={() => handleDownload(selectedImage.imageUrl, selectedImage.prompt, selectedImage._id)}
                    className="bg-white/90 hover:bg-white text-black"
                  >
                    <Download className="h-4 w-4 mr-2" />
                    Download
                  </Button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default Gallery;