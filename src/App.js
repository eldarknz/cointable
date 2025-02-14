import { useEffect, useState } from "react";

import "./App.css";

export default function App() {
  // Состояние для хранения исходных данных, отсортированных данных и направлений сортировки
  const [data, setData] = useState([]);
  const [sortedData, setSortedData] = useState([]);
  const [sortDirections, setSortDirections] = useState({});

  // Функция сортировки данных по клику на заголовок столбца
  const sortfn = (key) => {
    // Получаем текущее направление сортировки для столбца (если не задано, то 'default')
    const currentDirection = sortDirections[key] || "default";
    // Определяем новое направление сортировки
    const newDirection =
      currentDirection === "asc"
        ? "desc"
        : currentDirection === "desc"
        ? "default"
        : "asc";

    // Копируем данные, чтобы не мутировать оригинальные данные
    let sorted = [...data];

    // Если новое направление сортировки не 'default', выполняем сортировку
    if (newDirection !== "default") {
      sorted.sort((a, b) => {
        const aValue = a[key];
        const bValue = b[key];

        // Преобразуем строки в числа, если это возможно (для числовых значений)
        const aNumericValue = isNaN(parseFloat(aValue))
          ? aValue
          : parseFloat(aValue);
        const bNumericValue = isNaN(parseFloat(bValue))
          ? bValue
          : parseFloat(bValue);

        // Если оба значения — строки, сортируем их лексикографически
        if (
          typeof aNumericValue === "string" &&
          typeof bNumericValue === "string"
        ) {
          return newDirection === "asc"
            ? aNumericValue.localeCompare(bNumericValue) // Сортировка по возрастанию
            : bNumericValue.localeCompare(aNumericValue); // Сортировка по убыванию
        } else if (
          typeof aNumericValue === "number" &&
          typeof bNumericValue === "number"
        ) {
          // Если оба значения — числа, выполняем обычное числовое сравнение
          return newDirection === "asc"
            ? aNumericValue - bNumericValue // Сортировка по возрастанию
            : bNumericValue - aNumericValue; // Сортировка по убыванию
        }

        return 0;
      });
    }

    // Обновляем отсортированные данные и направление сортировки для текущего столбца
    setSortedData(sorted);
    setSortDirections((prevState) => ({ ...prevState, [key]: newDirection }));
  };

  // Функция для обработки данных, чтобы заменить пустые или недостающие значения на null
  const handleData = (data) => {
    return data.map((item) => {
      const hash = {};
      Object.keys(item).forEach((key) => {
        // Если значение пустое или null, заменяем его на null
        const value = item[key] === "" || item[key] == null ? 0 : item[key];
        hash[key] = value;
      });
      return hash;
    });
  };

  // Загружаем данные с API при монтировании компонента
  useEffect(() => {
    const fetchData = async () => {
      // Запрашиваем данные с API
      const response = await fetch("https://api.coinlore.net/api/tickers/");
      const result = await response.json();
      // Обрабатываем данные и сохраняем их в состояние
      const handledData = handleData(result.data);

      setData(handledData); // Сохраняем данные в состояние
      setSortedData(handledData); // Изначально показываем данные без сортировки
    };

    fetchData();
  }, []);

  return (
    <div className="app">
      <table className="table">
        {sortedData.length > 0 && (
          <>
            <thead>
              <tr className="table__row">
                {Object.keys(sortedData[0]).map((item) => (
                  <th className="table__header" key={item} onClick={() => sortfn(item)}>
                    <span>{item.toUpperCase()}</span>
                    <span className={`table__sort-icon table__sort-icon--${sortDirections[item] || 'default'}`}>
                      {sortDirections[item] === "asc"
                        ? "↑"
                        : sortDirections[item] === "desc"
                        ? "↓"
                        : "↕"}
                    </span>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {sortedData.map((row, index) => (
                <tr className="table__row" key={index}>
                  {Object.values(row).map((value, idx) => (
                    <td className="table__cell" key={idx}>{value ? value : "-"}</td>
                  ))}
                </tr>
              ))}
            </tbody>
          </>
        )}
      </table>
    </div>

  );
}
