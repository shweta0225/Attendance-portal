import React, { useState, useEffect } from "react";
import { useLocation } from "react-router-dom";
import axios from "axios";

const getDaysInMonth = (year, month) => {
  return new Date(year, month + 1, 0).getDate();
};

const createAttendanceGrid = (year, month) => {
  const daysInMonth = getDaysInMonth(year, month);
  const firstDayOfMonth = new Date(year, month, 1).getDay();
  const grid = [];
  let currentDay = 1;

  for (let row = 0; row < 5; row++) {
    const week = [];
    for (let col = 0; col < 7; col++) {
      if (row === 0 && col < firstDayOfMonth) {
        week.push(null);
      } else if (currentDay <= daysInMonth) {
        week.push({ date: currentDay, present: Math.random() < 0.5 }); 
        currentDay++;
      } else {
        week.push(null);
      }
    }
    grid.push(week);
  }

  return grid;
};

const AttendanceGrid = () => {
  const [year, setYear] = useState(new Date().getFullYear());
  const [month, setMonth] = useState(new Date().getMonth());
  const [selectedRowIndex, setSelectedRowIndex] = useState(null);
  const [selectedColIndex, setSelectedColIndex] = useState(null);
  const [attendance, setAttendance] = useState([]);
  const [newStatus, setNewStatus] = useState(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const location = useLocation();
  const params = new URLSearchParams(location.search);
  const username = params.get("username");

  const handleGridClick = (rowIndex, colIndex) => {
    const currentDate = new Date();
    const clickedDate = new Date(
      year,
      month,
      attendance[rowIndex][colIndex].date
    );
    if (clickedDate > currentDate) {
      return;
    }
    setSelectedRowIndex(rowIndex);
    setSelectedColIndex(colIndex);
    setIsDialogOpen(true);
  };
  const handleCloseDialog = () => {
    setIsDialogOpen(false);
    setNewStatus(null);
  };
  const handleSaveChanges = async () => {
  if (
    newStatus !== null &&
    selectedRowIndex !== null &&
    selectedColIndex !== null
  ) {
    try {
      const clickedDay = attendance[selectedRowIndex][selectedColIndex].date;
      const clickedDate = new Date(year, month, clickedDay);
      const status = newStatus ? "present" : "absent";
      const formattedDate = `${clickedDate.getFullYear()}-${(clickedDate.getMonth() + 1)
        .toString()
        .padStart(2, "0")}-${clickedDate
        .getDate()
        .toString()
        .padStart(2, "0")}`;

      const data = { username, date: formattedDate, status };
      await axios.post("http://localhost:5000/attendance", data);
        setAttendance((prevAttendance) => {
          const updatedAttendance = [...prevAttendance];
          if (
            updatedAttendance[selectedRowIndex] &&
            updatedAttendance[selectedRowIndex][selectedColIndex]
          ) {
            updatedAttendance[selectedRowIndex][selectedColIndex] = {
              ...updatedAttendance[selectedRowIndex][selectedColIndex],
              present: newStatus,
            };
          }
          return updatedAttendance;
        });
        setIsDialogOpen(false);
        setNewStatus(null);
      } catch (error) {
        console.error("Error saving attendance:", error);
      }
    }
  };

  useEffect(() => {
    setAttendance(createAttendanceGrid(year, month));
  }, [year, month]);

  const handlePreviousMonth = () => {
    setMonth((prevMonth) => (prevMonth === 0 ? 11 : prevMonth - 1));
    if (month === 0) {
      setYear((prevYear) => prevYear - 1);
    }
  };
  const handleNextMonth = () => {
    setMonth((prevMonth) => (prevMonth === 11 ? 0 : prevMonth + 1));
    if (month === 11) {
      setYear((prevYear) => prevYear + 1);
    }
  };

  return (
    <div className="container mx-auto mt-8">
      <h1 className="text-2xl font-bold mb-4">Hi, {username}</h1>
      <div className="mb-4 flex justify-between items-center">
        <button
          className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
          onClick={handlePreviousMonth}
        >
          Previous Month
        </button>
        <h2 className="text-3xl font-bold mb-2">
          {new Date(year, month).toLocaleDateString("en-US", {
            month: "long",
            year: "numeric",
          })}
        </h2>
        <button
          className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
          onClick={handleNextMonth}
        >
          Next Month
        </button>
      </div>
      
      <div className="grid grid-cols-7 md:grid-cols-7 gap-2 relative">
        {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((day, index) => (
          <div key={day} className="text-center font-bold text-sm">
            {day}
          </div>
        ))}
        {attendance.map((week, rowIndex) =>
          week.map((cell, colIndex) => {
            const isFutureDate =
              cell && new Date(year, month, cell.date) > new Date(); 

            return (
              <div
                key={`${rowIndex}-${colIndex}`}
                className={`flex flex-col items-center justify-center h-16 md:h-20 border border-gray-300 rounded cursor-pointer ${
                  isFutureDate
                    ? "bg-gray-200" 
                    : cell && cell.present
                    ? "bg-green-200"
                    : "bg-red-200"
                }`}
                onClick={() => {
                  if (!isFutureDate) {
                    handleGridClick(rowIndex, colIndex);
                  }
                }}
              >
                <div className="text-xs md:text-sm">
                  {cell ? cell.date : ""}
                </div>
                {!isFutureDate && (
                  <div className="text-xs md:text-base font-bold">
                    {cell ? (cell.present ? "Present" : "Absent") : ""}
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>

      {isDialogOpen &&
        selectedRowIndex !== null &&
        selectedColIndex !== null && (
          <div className="fixed inset-0 flex items-center justify-center">
            <div className="fixed inset-0 bg-gray-800 bg-opacity-50"></div>
            <div className="bg-white p-8 rounded shadow-lg relative z-10">
              <div
                className="text-black absolute top-0 right-0 cursor-pointer"
                onClick={handleCloseDialog}
              >
                <div
                  className="text-black absolute top-1 right-2 cursor-pointer"
                  onClick={handleCloseDialog}
                >
                  <span className="text-xl font-bold">X</span>
                </div>
              </div>
              <p className="text-lg font-semibold mb-4">Edit Status</p>
              <p className="mb-2">User: {username}</p>

              {attendance[selectedRowIndex] &&
                attendance[selectedRowIndex][selectedColIndex] && (
                  <p className="mb-4">
                    Date:{" "}
                    {`${attendance[selectedRowIndex][selectedColIndex].date}/${
                      month + 1
                    }/${year}`}
                  </p>
                )}

              <div className="flex items-center mb-4">
                <label className="inline-flex items-center mr-4">
                  <input
                    type="radio"
                    value="present"
                    checked={newStatus === true}
                    onChange={() => setNewStatus(true)}
                    className="form-radio h-5 w-5 text-blue-600"
                  />
                  <span className="ml-2 text-sm">Present</span>
                </label>

                <label className="inline-flex items-center">
                  <input
                    type="radio"
                    value="absent"
                    checked={newStatus === false}
                    onChange={() => setNewStatus(false)}
                    className="form-radio h-5 w-5 text-red-600"
                  />
                  <span className="ml-2 text-sm">Absent</span>
                </label>
              </div>

              <div className="flex justify-end">
                <button
                  className="bg-blue-500 text-white px-4 py-2 rounded mr-10 hover:bg-blue-600 transition-colors duration-300"
                  onClick={handleSaveChanges}
                >
                  Save
                </button>
              </div>
            </div>
          </div>
        )}
    </div>
  );
};

export default AttendanceGrid;