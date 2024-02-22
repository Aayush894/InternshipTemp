import Search from "./components/Search.jsx";

function App() {
  const data = [
    {
      id: 1,
      title: "Trees",
      Course: "Intoduction of Trees",
      Content: ["Binary Tree", "BST", "Generic Tree"],
    },
    {
      id: 2,
      title: "Graphs",
      Topics: ["BFS", "DFS", "Topological Sort"],
    },
    {
      id: 3,
      title: "Backtracking",
      Content: ["Recursion", "N-Queens"],
    },
    {
      id: 4,
      title: "Recursion",
      Topics: ["direct", "indirect"],
    },
    {
      id: 5,
      title: "Dynamic Programming",
      Topics: ["TopDown", "BottomUp"],
    }
  ];

  return (
    <>
      <Search data={data}></Search>
    </>
  );
}

export default App;
