body {
    font-family: Arial, sans-serif;
    text-align: center;
    background-color: #f5f5f5;
    margin: 0;
    padding: 0;
}

.container {
    max-width: 400px;
    margin: 20px auto;
    background: white;
    padding: 20px;
    border-radius: 10px;
    box-shadow: 0px 0px 10px rgba(0, 0, 0, 0.1);
}

.tabs {
    display: flex;
    justify-content: space-around;
    margin-bottom: 20px;
}

.tab-button {
    padding: 10px;
    width: 50%;
    cursor: pointer;
    border: none;
    background-color: #ccc;
}

.tab-button.active {
    background-color: #007bff;
    color: white;
}

.resumo div {
    margin: 10px;
    font-size: 18px;
    font-weight: bold;
}

.add-button {
    position: fixed;
    bottom: 20px;
    left: 50%;
    transform: translateX(-50%);
    background-color: #007bff;
    color: white;
    font-size: 24px;
    border: none;
    padding: 15px;
    border-radius: 50%;
    cursor: pointer;
    box-shadow: 0px 4px 6px rgba(0, 0, 0, 0.1);
}

/* Popup */
.popup {
    display: none;
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background: rgba(0, 0, 0, 0.5);
}

.popup-content {
    background: white;
    padding: 20px;
    margin: 15% auto;
    width: 80%;
    text-align: center;
}
