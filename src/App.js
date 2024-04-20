import React, { useState, useEffect } from 'react';
import axios from 'axios'; // Ayuda a hacer las peticiones HTTP
import './AppStyle.css';

function App() {
  const [query, setQuery] = useState(''); // Consulta de busqueda
  const [bookData, setBookData] = useState(null); // Informacion del libro seleccionado
  const [relatedBooks, setRelatedBooks] = useState([]); // Lista de libros seleccionados
  const [userModalOpen, setUserModalOpen] = useState(false); // Estado de la ventana usuario
  const [loginForm, setLoginForm] = useState(true); // Estado del formulario de inicio de sesion
  const [cart, setCart] = useState([]); // Lista de libros en el carrito
  const [userCredentials, setUserCredentials] = useState({ // Credenciales de usuario
    name: '',
    address: '',
    phone: '',
    email: '',
    password: ''
  });
  const [modalWidth, setModalWidth] = useState(400); // Ancho de la ventana modal
  const [modalHeight, setModalHeight] = useState(300); // Altura de la ventana modal
  const [cartModalOpen, setCartModalOpen] = useState(false); // Estado del modal del carrito
  const [recommendedBooks, setRecommendedBooks] = useState([]); // Libros recomendados

  useEffect(() => {
    // Llamada a la función para obtener libros aleatorios al cargar la página
    getRecommendedBooks();
  }, []);

  useEffect(() => {
    if (query && !userModalOpen) {
      searchBooks();
    }
  }, [query, userModalOpen]);

  // Funcion para buscar libros 

  const searchBooks = async () => {
    try {
      const response = await axios.get(`https://www.googleapis.com/books/v1/volumes?q=${query}`);
      const book = response.data.items[0]; // Tomamos el primer libro de la respuesta
      setBookData(book);
      if (book && book.volumeInfo && book.volumeInfo.categories && book.volumeInfo.categories.length > 0) {
        const category = book.volumeInfo.categories[0];
        const relatedResponse = await axios.get(`https://www.googleapis.com/books/v1/volumes?q=subject:${category}&maxResults=3`);
        setRelatedBooks(relatedResponse.data.items);
      } else {
        setRelatedBooks([]);
      }
    } catch (error) {
      console.error('Error fetching book data:', error);
    }
  };

  const handleInputChange = (event) => {
    setQuery(event.target.value);
  };

  const handleSearch = () => {
    searchBooks();
  };

  const handleRelatedBookClick = async (title) => {
    setQuery(title); // Establecer el título del libro relacionado como consulta
  };

  const handleOpenCartModal = () => {
    setUserModalOpen(false); // Cerrar el modal de usuario
    setCartModalOpen(true); // Abrir el modal del carrito
    setLoginForm(false); // No mostramos ningún formulario en la ventana modal
    setBookData(null); // Limpiar la información del libro
    setRelatedBooks([]); // Limpiar los libros relacionados
    setQuery(''); // Limpiar el texto de búsqueda
  };


  const handleOpenUserModal = () => {
    setUserModalOpen(true);
    setModalWidth(200); // Establecer el ancho deseado
    setModalHeight(100); // Establecer la altura deseada
    setLoginForm(true); // Establecer el formulario de inicio de sesión como activo por defecto
    setBookData(null); // Limpiar la información del libro
    setRelatedBooks([]); // Limpiar los libros relacionados
    setQuery(''); // Limpiar el texto de búsqueda
    setCartModalOpen(false); // Cerrar el modal del carrito
  };


  const handleCloseUserModal = () => {
    setUserModalOpen(false);
  };

  const handleCloseCartModal = () => {
    setCartModalOpen(false);
  }

  const handleUserInputChange = (event) => {
    const { name, value } = event.target;
    setUserCredentials({ ...userCredentials, [name]: value });
  };

  const handleSubmitUserCredentials = (event) => {
    event.preventDefault();
    // Aquí puedes manejar la lógica para enviar los datos del usuario a tu backend o hacer lo que necesites con ellos
    console.log(userCredentials);
  };

  const handleToggleForm = () => {
    setLoginForm(!loginForm);
  };

  const handleAddToCart = () => {
    const existingBookIndex = cart.findIndex(item => item.title === bookData.volumeInfo.title);
    if (existingBookIndex !== -1) {
      // Si el libro ya está en el carrito, aumentamos su cantidad
      const updatedCart = [...cart];
      updatedCart[existingBookIndex].quantity += 1;
      setCart(updatedCart);
    } else {
      // Si el libro no está en el carrito, lo agregamos con una cantidad inicial de 1
      const newBook = {
        title: bookData.volumeInfo.title,
        price: 25, // Costo base de $25 por libro
        thumbnail: bookData.volumeInfo.imageLinks.thumbnail,
        quantity: 1
      };
      setCart([...cart, newBook]);
    }
  };

  const handleClearCart = () => {
    setCart([]);
  };

  const handleRemoveFromCart = (index) => {
    const updatedCart = [...cart];
    updatedCart.splice(index, 1);
    setCart(updatedCart);
  };

  const getTotalCost = () => {
    return cart.reduce((total, book) => total + (book.price * book.quantity), 0);
  };
  const handleIncreaseQuantity = (index) => {
    const updatedCart = [...cart];
    updatedCart[index].quantity += 1;
    setCart(updatedCart);
  };

  const handleDecreaseQuantity = (index) => {
    const updatedCart = [...cart];
    if (updatedCart[index].quantity > 1) {
      updatedCart[index].quantity -= 1;
      setCart(updatedCart);
    }
  };


  const UserTab = ({ onClick }) => {
    return (
      <button className="custom-button" onClick={onClick}>Usuario</button>
    );
  };

  const [randomBooks, setRandomBooks] = useState([]);

  // Función para obtener libros aleatorios
  const getRecommendedBooks = async () => {
    try {
      const response = await axios.get(`https://www.googleapis.com/books/v1/volumes?q=subject:fiction&maxResults=4`);
      setRecommendedBooks(response.data.items);
    } catch (error) {
      console.error('Error fetching recommended books:', error);
    }
  };

  return (
    <div className="App" style={{ backgroundColor: '#23395B', color: '#FFF', textAlign: 'center', padding: '1px' }}>
      <header className="App-header">
        <h1 className="main-title">RABE Librería</h1>
        <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '10px' }}>
          <button className="custom-button" onClick={handleOpenUserModal}>Usuario</button>
          <button className="custom-button" onClick={handleOpenCartModal}>Carrito</button>
          <button className="custom-button" onClick={() => alert("Configuraciones")}>Configuraciones</button>
        </div>
        <div>
          <input className="search-bar" type="text" placeholder="Buscar libro..." value={query} onChange={handleInputChange} />
          <button className="search-button" onClick={handleSearch}>Buscar</button>
        </div>
      </header>

      {bookData && (
        <div className="book-info">
          <div className="left-content">
            <h2>{bookData.volumeInfo.title}</h2>
            <p>{bookData.volumeInfo.authors && bookData.volumeInfo.authors.join(', ')}</p>
            {bookData.volumeInfo.imageLinks && (
              <img src={bookData.volumeInfo.imageLinks.thumbnail} alt="Portada del libro" style={{ width: '150px', height: '200px', margin: '0 auto', display: 'block' }} />
            )}
          </div>
          <div className="right-content">
            <div className="description-box">
              <p>{bookData.volumeInfo.description}</p>
            </div>
            <button className="custom-button" onClick={handleAddToCart} style={{ marginTop: '10px' }}>Agregar al carrito</button>
          </div>
        </div>
      )}

      {relatedBooks.length > 0 && (
        <div className="related-books">
          <h2 style={{ marginTop: '20px' }}>Libros relacionados</h2>
          <div className="related-books-container">
            {relatedBooks.map((book, index) => (
              <div key={index} className="related-book" onClick={() => handleRelatedBookClick(book.volumeInfo.title)}>
                <p>{book.volumeInfo.title}</p>
                <p>{book.volumeInfo.authors && book.volumeInfo.authors.join(', ')}</p>
                {book.volumeInfo.imageLinks && (
                  <img src={book.volumeInfo.imageLinks.thumbnail} alt="Portada del libro" style={{ width: '50px', height: '70px', margin: '0 auto', display: 'block' }} />
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {userModalOpen && (
        <div className="modal-overlay">
          <div className="modal">
            <span className="close" onClick={handleCloseUserModal}>Cerrar</span>
            <div className="modal-content">
              <h2>{loginForm ? 'Inicio de Sesión' : 'Registro'}</h2>
              <form onSubmit={handleSubmitUserCredentials} className="user-form">
                {loginForm ? (
                  <>
                    <label htmlFor="email">Correo:</label>
                    <input type="email" id="email" name="email" value={userCredentials.email} onChange={handleUserInputChange} placeholder="Ingresa tu correo" />
                    <label htmlFor="password">Contraseña:</label>
                    <input type="password" id="password" name="password" value={userCredentials.password} onChange={handleUserInputChange} placeholder="Ingresa la contraseña" />
                  </>
                ) : (
                  <>
                    <label htmlFor="name">Nombre:</label>
                    <input type="text" id="name" name="name" value={userCredentials.name} onChange={handleUserInputChange} placeholder="Nombre/s" />
                    <label htmlFor="address">Dirección:</label>
                    <input type="text" id="address" name="address" value={userCredentials.address} onChange={handleUserInputChange} placeholder="Direccion" />
                    <label htmlFor="phone">Teléfono:</label>
                    <input type="text" id="phone" name="phone" value={userCredentials.phone} onChange={handleUserInputChange} placeholder="Telefono a 10 digitos" />
                    <label htmlFor="email">Correo:</label>
                    <input type="email" id="email" name="email" value={userCredentials.email} onChange={handleUserInputChange} placeholder="Correo" />
                    <label htmlFor="password">Contraseña:</label>
                    <input type="password" id="password" name="password" value={userCredentials.password} onChange={handleUserInputChange} placeholder="Contraseña" />
                  </>
                )}
                <button type="submit" className="submit-button">{loginForm ? 'Iniciar Sesión' : 'Registrarse'}</button>
              </form>
              <button type="button" onClick={handleToggleForm} className="toggle-button">{loginForm ? 'Registrarse' : 'Iniciar Sesión'}</button>
            </div>
          </div>
        </div>
      )}

      {cartModalOpen && (
        <div className="modal-overlay">
          <div className="modal">
            <span className="close" onClick={handleCloseCartModal}>Cerrar</span>
            <div className="modal-content">
              <h2>Carrito</h2>
              <div>
                {cart.length === 0 ? (
                  <p>No hay libros en el carrito.</p>
                ) : (
                  <>
                    <ul>
                      {cart.map((item, index) => (
                        <li key={index} className="cart-item">
                          <div className="item-info">
                            <div className="thumbnail">
                              <img src={item.thumbnail} alt="Portada del libro" />
                            </div>
                            <div className="details">
                              <p className="detalles-pedido">{item.title} - ${item.price} x {item.quantity}</p>
                              <div className="quantity-controls">
                                <button className="quantity-button" onClick={() => handleIncreaseQuantity(index)}>+</button>
                                <button className="quantity-button" onClick={() => handleDecreaseQuantity(index)}>-</button>
                              </div>
                            </div>
                          </div>
                          <button className="remove-button" onClick={() => handleRemoveFromCart(index)}>Eliminar</button>
                        </li>
                      ))}
                    </ul>
                    <p className="total-price">Total: ${getTotalCost()}</p>
                  </>
                )}
                <button className="clear-cart-button" onClick={handleClearCart}>Limpiar Carrito</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default App;
