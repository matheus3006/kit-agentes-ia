// Entry do consolidado — renderiza a engine única travada num papel.
// Num protótipo multi-superfície, cada consolidado tem seu app.jsx travando o papel
// dele; a troca de papel é feita pelo hub (tabs), não por um switcher interno.
ReactDOM.createRoot(document.getElementById('root')).render(
  React.createElement(AppShell, { role: 'user' })
);
