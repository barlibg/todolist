import './App.css';
import React, { useState, useEffect } from 'react';
import { AiOutlineDelete } from 'react-icons/ai';
import { BsCheckLg } from 'react-icons/bs';
import { RiArrowGoBackFill } from 'react-icons/ri';

function App() {
  const [allTodos, setTodos] = useState([]);
  const [completedTodos, setCompletedTodos] = useState([]);
  const [filteredTodos, setFilteredTodos] = useState([]);
  const [filteredCompletedTodos, setFilteredCompletedTodos] = useState([]);
  const [isCompleteScreen, setIsCompleteScreen] = useState(false);
  const [searchUserId, setSearchUserId] = useState('');
  const [sortTextOrder, setSortTextOrder] = useState('any');
  const [sortDateOrder, setSortDateOrder] = useState('any');
  const [userIds, setUserIds] = useState([]);

  useEffect(() => {
    const fetchTodos = async () => {
      try {
        const response = await fetch('https://jsonplaceholder.typicode.com/todos');
        const data = await response.json();

        const completed = data.filter(todo => todo.completed).map(todo => ({
          ...todo,
          completedOn: new Date().toLocaleDateString(),
        }));
        const uncompleted = data.filter(todo => !todo.completed);

        const ids = [...new Set(data.map(todo => todo.userId))]; 

        setTodos(uncompleted);
        setCompletedTodos(completed);
        setFilteredTodos(uncompleted);
        setFilteredCompletedTodos(completed);
        setUserIds(ids); 
      } catch (error) {
        console.error('Error fetching todos:', error);
      }
    };

    fetchTodos();
  }, []);

  const handleDeleteTodo = (index) => {
    const updatedAll = [...allTodos];
    updatedAll.splice(index, 1);
    setTodos(updatedAll);
    setFilteredTodos(updatedAll);
  };

  const handleComplete = (index) => {
    const completedOn = new Date().toLocaleDateString();
    const item = { ...filteredTodos[index], completedOn };
    const updatedCompleted = [...completedTodos, item];

    const updatedAll = [...allTodos];
    const originalIndex = allTodos.indexOf(filteredTodos[index]);
    if (originalIndex > -1) updatedAll.splice(originalIndex, 1);

    setCompletedTodos(updatedCompleted);
    setFilteredCompletedTodos(updatedCompleted);
    setTodos(updatedAll);
    setFilteredTodos(updatedAll);
  };

  const handleDeleteCompletedTodo = (index) => {
    const updatedCompleted = [...completedTodos];
    updatedCompleted.splice(index, 1);
    setCompletedTodos(updatedCompleted);
    setFilteredCompletedTodos(updatedCompleted);
  };

  const handleUnComplete = (index) => {
    const item = { ...filteredCompletedTodos[index] };
    delete item.completedOn;

    const updatedCompleted = [...completedTodos];
    const originalIndex = completedTodos.indexOf(filteredCompletedTodos[index]);
    if (originalIndex > -1) updatedCompleted.splice(originalIndex, 1);

    const updatedAll = [...allTodos, item];

    setCompletedTodos(updatedCompleted);
    setFilteredCompletedTodos(updatedCompleted);
    setTodos(updatedAll);
    setFilteredTodos(updatedAll);
  };

  const applyFilters = () => {
    const filterByUserId = (arr) => {
      return arr.filter(todo =>
        searchUserId.trim() === '' || String(todo.userId) === searchUserId.trim()
      );
    };

    const sortByTitle = (arr, direction) => {
      return [...arr].sort((a, b) => {
        if (direction === 'asc') return a.title.localeCompare(b.title);
        if (direction === 'desc') return b.title.localeCompare(a.title);
        return 0;
      });
    };

    const sortByDate = (arr, direction) => {
      return [...arr].sort((a, b) => {
        if (!a.completedOn || !b.completedOn) return 0;
        const dateA = new Date(a.completedOn);
        const dateB = new Date(b.completedOn);
        if (direction === 'asc') return dateA - dateB;
        if (direction === 'desc') return dateB - dateA;
        return 0;
      });
    };

    let filteredUncompleted = filterByUserId(allTodos);
    let filteredCompleted = filterByUserId(completedTodos);

    if (sortTextOrder !== 'any') {
      filteredUncompleted = sortByTitle(filteredUncompleted, sortTextOrder);
      filteredCompleted = sortByTitle(filteredCompleted, sortTextOrder);
    }

    if (sortDateOrder !== 'any') {
      filteredCompleted = sortByDate(filteredCompleted, sortDateOrder);
    }

    setFilteredTodos(filteredUncompleted);
    setFilteredCompletedTodos(filteredCompleted);
  };

  return (
    <div className="App">
      <h1> My Todos </h1>
      <div className='todo-wrapper'>
        <div className="btn-area">
          <div className="btnContainer">
            <label>Filter by User ID:</label>
            <select onChange={(e) => setSearchUserId(e.target.value)} value={searchUserId}>
              <option value="">All</option>
              {userIds.map((id) => (
                <option key={id} value={id}>{id}</option>
              ))}
            </select>

            <label>Sort by Text:</label>
            <select onChange={(e) => setSortTextOrder(e.target.value)}>
              <option value="any">Any</option>
              <option value="asc">Ascending</option>
              <option value="desc">Descending</option>
            </select>

            <label>Sort by Date:</label>
            <select onChange={(e) => setSortDateOrder(e.target.value)}>
              <option value="any">Any</option>
              <option value="asc">Ascending</option>
              <option value="desc">Descending</option>
            </select>

            <button className="filterButton" onClick={applyFilters}>Apply Filters</button>
          </div>
        </div>
        <div className="btnContainer">
          <button className="primaryBtn" onClick={() => setIsCompleteScreen(false)}> Todo </button>
          <button className="secondaryBtn" onClick={() => setIsCompleteScreen(true)}> Complete </button>
        </div>

        <div className="todo-list">
          {!isCompleteScreen &&
            filteredTodos.map((item, index) => (
              <div key={index} className="todo-list-item">
                <h3>{item.title}</h3>
                <div>
                  <AiOutlineDelete className="icon" onClick={() => handleDeleteTodo(index)} title="Delete?" />
                  <BsCheckLg className="check-icon" onClick={() => handleComplete(index)} title="Complete?" />
                </div>
              </div>
            ))}
          {isCompleteScreen &&
            filteredCompletedTodos.map((item, index) => (
              <div key={index} className="todo-list-item">
                <h3>{item.title}</h3>
                <p><small>Completed on: {item.completedOn}</small></p>
                <div>
                  <AiOutlineDelete className="icon" onClick={() => handleDeleteCompletedTodo(index)} title="Delete?" />
                  <RiArrowGoBackFill className="return-icon" onClick={() => handleUnComplete(index)} title="UnComplete?" />
                </div>
              </div>
            ))}
        </div>
      </div>
    </div>
  );
}

export default App;
