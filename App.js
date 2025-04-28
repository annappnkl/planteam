import React, { useState, useEffect } from 'react';
import { Avatar, Banner, Dialog, Portal, ProgressBar, Divider, Button, Menu, IconButton, Card, Title, Paragraph, DefaultTheme, Provider as PaperProvider, Appbar, ThemeProvider } from 'react-native-paper';
import { ImageBackground, Image, View, ScrollView } from 'react-native';

const App = () => {

  const empty = "none";

  const [login, setLogin] = useState(true);
  const [menuVisible, setMenuVisible] = useState(false);
  const [bannerVisible, setBannerVisible] = useState(false);
  const [connectionErrorDialogVisible, setConnectionErrorDialog] = useState(false);
  const [connectionCancelDialogVisible, setConnectionCancelDialog] = useState(false);
  const [coasterOfflineDialogVisible, setCoasterOfflineDialogVisible] = useState(false);
  const [plantboxOfflineDialogVisible, setPlantboxOfflineDialogVisible] = useState(false);

  const checkInterval = 6000;
  const [userID, setUserID] = useState(null);
  const serverPrefix = "https://ubicomp.net/sw/db1/var2db.php?varName=planteam-";

  // Account Properties
  const [username, setUsername] = useState("null");
  const [log1, setLog1] = useState("T_00_14-3-2021_00-00");
  const [log2, setLog2] = useState("W_00_14-3-2021_00-00-00_true");
  const [log3, setLog3] = useState("W_00_14-3-2021_00-00-00_false");
  const [plantbox, setPlantbox] = useState("plantbox01");
  const [coaster, setCoaster] = useState("coaster01");

  // Coaster Properties
  const [coasterOwner, setCoasterOwner] = useState("none");
  const [coasterActive, setCoasterActive] = useState(false);
  const [coasterPlantbox, setCoasterPlantbox] = useState("false");

  // Plantbox Properties 
  const [plantboxOwner, setPlantboxOwner] = useState("");
  const [plantboxMoisture, setPlantboxMoisture] = useState("100");
  const [plantboxTank, setPlantboxTank] = useState("100");
  const [plantboxWateringPermission, setPlantboxWateringPermission] = useState("");
  const [plantboxWaterer, setPlantboxWaterer] = useState("none");
  const [plantboxTankMin, setPlantboxTankMin] = useState(null);
  const [lastSeenDate, setLastSeenDate] = useState("12-12-12");
  const [lastSeenTime, setLastSeenTime] = useState("00-00-00");
  const [plantboxActive, setPlantboxActive] = useState(false);

  useEffect(() => {
    const id = setInterval(() => {


      fetchData(serverPrefix + userID + "-log1", setLogDependingOnRecency);

      //fetchData(serverPrefix + plantbox + "-ping", comparePlantboxPing);
      //fetchData(serverPrefix + coaster + "-ping", compareCoasterPing);

      //DEBUGGING

      //fetch(serverPrefix + coaster + "-plantbox" + "&varValue=" + "true");
      fetch(serverPrefix + plantbox + "-waterer" + "&varValue=" + "Kathrin");
      console.log(plantboxWaterer + " and" + username)
      if (plantboxWaterer != "none" && plantboxWaterer != username) {
        setBannerVisible(true);
      }
      //fetch(serverPrefix + coaster + "-owner" + "&varValue=" + "Kathrin");
      setCoasterActive(true);
      setPlantboxActive(true);
      //createLogEntry("T", "Anna");

      // DEBUGGING - END 

      if (plantboxActive) {
        console.log("Updating plantbox stats...");

        fetchData(serverPrefix + plantbox + "-waterer", setPlantboxWaterer);
        fetchData(serverPrefix + plantbox + "-moisture", setPlantboxMoisture);
        fetchData(serverPrefix + plantbox + "-tank", setPlantboxTank)

      }

      if (coasterActive) {
        fetchData(serverPrefix + coaster + "-plantbox", setCoasterPlantbox);
      }


    }, checkInterval);

    return () =>
      clearInterval(id);
  }, [userID, coasterPlantbox]);

  function fetchData(url, dest) {
    return fetch(url)
      .then((response) => response.text())
      .then((text) => dest(text.replace("+%0A", "").trim()));
  };



  function setLogDependingOnRecency(log) {
    const previousLog = log1;
    if (log != previousLog) {
      console.log("not the same: " + log + " and old: " + previousLog);
      setBannerVisible(true);
      setLog1(log);
      fetchData(serverPrefix + userID + "-log2", setLog2);
      fetchData(serverPrefix + userID + "-log3", setLog3);
    } else {
      console.log("Log didn't change");
      console.log("the same: " + log + " and old: " + previousLog);
      setBannerVisible(false);
    }
  }


  //#region Ping Methods

  function comparePlantboxPing(receivedPing) {
    if (receivedPing == "true") {
      setPlantboxActive(true);
      fetch(serverPrefix + plantbox + "-ping" + "&varValue=false");
      const newDate = getCurrentDay();
      setLastSeenDate(newDate);
      fetch(serverPrefix + plantbox + "-ping1" + "&varValue=" + newDate);
      const newTime = getCurrentTime();
      setLastSeenTime(newTime);
      fetch(serverPrefix + plantbox + "-ping2" + "&varValue=" + newTime);
    } else {
      setPlantboxActive(false);
      if (coasterPlantbox !== "none") {
        setPlantboxOfflineDialogVisible(true);
        setCoasterPlantbox("none");
        fetch(serverPrefix + coaster + "plantbox" + "&varValue=" + "false");
        if (plantboxWaterer == coasterOwner) {
          setPlantboxWaterer("none");
          fetch(serverPrefix + plantbox + "-waterer" + "&varValue=" + "none");
          createLogEntry("water", coasterOwner);
        }
      }
    }
  }

  function compareCoasterPing(receivedPing) {
    if (receivedPing == "true") {
      setCoasterActive(true);
      fetch(serverPrefix + coaster + "-ping" + "&varValue=false");
    } else {
      setCoasterActive(false);
      if (coasterPlantbox !== "none") {
        setCoasterOfflineDialogVisible(true);
        setCoasterPlantbox("none");
        fetch(serverPrefix + coaster + "plantbox" + "&varValue=" + "false");
        if (coasterOwner == plantboxWaterer) {
          setPlantboxWaterer("none");
          fetch(serverPrefix + plantbox + "-waterer" + "&varValue=" + "none");
          createLogEntry("water", coasterOwner);
        }
      }
    }
  }
  //#endregion

  //#region Time and Date Methods

  function getCurrentDay() {
    const date = new Date();
    return (date.getDate() + "-" + (date.getMonth() + 1) + "-" + date.getFullYear());
  }

  function getCurrentTime() {
    const date = new Date();
    return (date.getHours() + "-" + date.getMinutes() + "-" + date.getSeconds());
  }

  const analyzeTimeStamp = (date, time) => {
    if (date == getCurrentDay()) {
      return convertTimeFormat(time);
    } else if (parseInt(convertDateFormat(date).slice(0, 2)) == parseInt(convertDateFormat(getCurrentDay()).slice(0, 2)) - 1) {
      return "yesterday"
    } else {
      return convertDateFormat(date);
    }
  }

  const convertDateFormat = (date) => {
    var dateArray = date.split("-");
    let day = dateArray[0];
    let month = dateArray[1];
    let year = dateArray[2];
    day.length == 1 ? day = "0" + day : null;
    month.length == 1 ? month = "0" + month : null;
    return day + "/" + month + "/" + year;
  }

  const convertTimeFormat = (time) => {
    let timeArray = time.split("-");
    let hours = timeArray[0];
    let minutes = timeArray[1];
    hours.length == 1 ? hours = "0" + hours : null;
    minutes.length == 1 ? minutes = "0" + minutes : null;
    return hours + ":" + minutes;
  }

  //#endregion

  //#region Account Data Fetching Methods
  function fetchAccountData(id) {

    fetchData(serverPrefix + id + "-username", setUsername);
    fetchData(serverPrefix + id + "-log1", setLog1);
    fetchData(serverPrefix + id + "-log2", setLog2);
    fetchData(serverPrefix + id + "-log3", setLog3);
    fetchData(serverPrefix + id + "-plantbox", setPlantbox);
    fetchData(serverPrefix + id + "-coaster", setCoaster);

    fetchData(serverPrefix + coaster + "-owner", setCoasterOwner);
    fetchData(serverPrefix + coaster + "-plantbox", setCoasterPlantbox);

    fetchData(serverPrefix + plantbox + "-owner", setPlantboxOwner);
    fetchData(serverPrefix + plantbox + "-ping1", setLastSeenDate);
    fetchData(serverPrefix + plantbox + "-ping2", setLastSeenTime);
    fetchData(serverPrefix + plantbox + "-moisture", setPlantboxMoisture);
    fetchData(serverPrefix + plantbox + "-tank", setPlantboxTank);
    fetchData(serverPrefix + plantbox + "-wateringPermission", setPlantboxWateringPermission);
    fetchData(serverPrefix + plantbox + "-waterer", setPlantboxWaterer);
    // if (plantboxWaterer != "none" && plantboxWaterer != username) {
    //   setBannerVisible(true);
    // }

  }

  const selectAccount = (id) => {
    setUserID(id);
    fetchAccountData(id);
    setMenuVisible(false);
    setLogin(false);
  }

  //#endregion

  //#region UI Methods (Menu, Plantbox Stats Display)

  const displayStatus = (variable) => {
    var col = theme.colors.text;
    switch (parseInt(variable)) {
      case 0:
        col = theme.colors.low;
        break;
      case 50:
        col = theme.colors.medium;
        break;
      case 100:
        col = theme.colors.high;
        break;
      default:
    }
    return col;
  }

  const openMenu = () => {
    setMenuVisible(true);
  }

  const hideConnectionErrorDialog = () => {
    setConnectionErrorDialogVisible(false);
  }

  const hideCoasterOfflineDialog = () => {
    setCoasterOfflineDialogVisible(false);
  }

  const hidePlantboxOfflineDialog = () => {
    setPlantboxOfflineDialogVisible(false);
  }

  const declineCoasterDisconnection = () => {
    console.log("Disconnection cancelled.");
    setConnectionCancelDialog(false);
  }

  const confirmCoasterDisconnection = () => {
    setPlantboxWaterer("none");
    fetch(serverPrefix + plantbox + "-waterer" + "&varValue=" + "none");
    setCoasterPlantbox("false");
    fetch(serverPrefix + coaster + "plantbox" + "&varValue=" + "false");
    console.log("Disconnection confirmed.");
    setConnectionCancelDialog(false);
    if (coasterOwner != plantboxOwner) {
      createLogEntry("water", coasterOwner);
      console.log("Created Log entry");
    }
  }

  //#endregion

  const changeCoasterConnection = () => {
    //TODO: only if plantbox is active
    if (coasterPlantbox == "true" && coasterActive) {
      if (coasterOwner == plantboxWaterer) {
        setConnectionCancelDialog(true);
      } else {
        setCoasterPlantbox("false");
        fetch(serverPrefix + coaster + "plantbox" + "&varValue=" + "false");
        console.log("Coaster successfully disconnected." + " " + "Coaster: " + coasterOwner + "Plantboxwaterer: " + plantboxWaterer);
      }
    } else if (coasterPlantbox == "false") {
      if (coasterActive) {
        setCoasterPlantbox("true");
        fetch(serverPrefix + coaster + "-plantbox" + "&varValue=" + "true");
        console.log("Coaster successfully connected.");
      } else {
        setConnectionErrorDialog(true);
        console.log("Coaster currently unavailable.");
      }
    } else {
      console.log("An unexpected case ocurred: " + coasterPlantbox + " " + coasterActive);
    }
  }

  const createLogEntry = (type, sender) => {

    let ID = (sender == "Anna" ? "02" : "01");
    const urlPrefix = serverPrefix + "user" + ID;
    const date = getCurrentDay();
    const time = getCurrentTime()
    let newLog;
    if (type == "W") {
      newLog = type + "_" + ID + "_" + date + "_" + time + "_" + "false";
      console.log(newLog);
    } else if (type == "T") {
      newLog = type + "_" + ID + "_" + date + "_" + time;
    } else {
      return (console.log("Undefined log type detected: " + type));
    }

    updateLog(newLog, urlPrefix);

  }

  const updateLog = (logEntry, urlPrefix) => {

    fetch(urlPrefix + "-log2")
      .then((response) => response.text())
      .then((text) => text.replace("+%0A", "").trim())
      .then((oldLog2) => fetch(urlPrefix + "-log3" + "&varValue=" + oldLog2));

    fetch(urlPrefix + "-log1")
      .then((response) => response.text())
      .then((text) => text.replace("+%0A", "").trim())
      .then((oldLog1) => fetch(urlPrefix + "-log2" + "&varValue=" + oldLog1));

    fetch(urlPrefix + "-log1" + "&varValue=" + logEntry);
    console.log("new Log entry: " + logEntry);

  }

  const sayThanks = (logEntry, logVariable) => {
    const log = logEntry;
    const newLog = log.split("_")[0] + "_" + log.split("_")[1] + "_" + log.split("_")[2] + "_" + log.split("_")[3] + "_true";
    console.log(serverPrefix + userID + "-" + logVariable + "&varValue=" + newLog);
    fetch(serverPrefix + userID + "-" + logVariable + "&varValue=" + newLog);
    logEntry = newLog;

    createLogEntry("T", username);
  }

  const displayAvatar = () => {
    let path = "";
    if (plantboxWaterer != username && plantboxWaterer !="none") {
      plantboxWaterer == "Anna" ? path = './assets/avatar-user01.png' : path = './assets/avatar-user02.png';
    } else {
      log1.split("_")[1] == "02" ? path = './assets/avatar-user01.png' : path = './assets/avatar-user02.png';
    }
    return path;
  }

  const displayMessage = () => {
    let message = "";
    if (plantboxWaterer != username && plantboxWaterer != "none") {
      message = plantboxWaterer + " is watering your plants 🙋‍♀️";
    } else {
      log1.split("_")[0] == "T" ? (log1.split("_")[1] == "02" ? message = "Anna  says thanks for watering 💚" : message = "Kathrin says thanks for watering 💚") : (log1.split("_")[1] == "02" ? message = "Anna watered your plants 💧" : message = "Kathrin watered your plants 💧")
    }

    return message;
  }



  return (
    <PaperProvider theme={theme}>

      <Appbar.Header style={{ paddingRight: 16, paddingBottom: 24, flexDirection: 'row', justifyContent: "space-between", alignItems: "center" }}>

        {!login ? (<Appbar.BackAction style={{ paddingTop: 14 }} color="#FFFFFF" onPress={() => setLogin(true)} />) : null}
        {!login ? (<Image source={require('./assets/planteam-white.png')} style={{ width: 155, height: 40 }} />) : null}
        {!login ? <Avatar.Image size={40} source={userID == "user01" ? require('./assets/avatar-user01' + '.png') : require('./assets/avatar-user02' + '.png')} /> : null}

      </Appbar.Header>

      {login ? (
        <View>

          <Image source={require('./assets/icon-login.png')} style={{ marginTop: 64, height: 200, width: 145, alignSelf: "center" }} />
          <Menu
            visible={menuVisible}
            anchor={
              <Button mode="contained" style={{ marginTop: 64, marginHorizontal: 100 }} onPress={openMenu}>Log In</Button>}>

            <Menu.Item onPress={() => { selectAccount("user01") }} title="Anna" />
            <Divider />
            <Menu.Item onPress={() => { selectAccount("user02") }} title="Kathrin" />
          </Menu>
        </View>
      ) : null}

      { !login ? (
        <ImageBackground source={require('./assets/background.jpg')} style={{ width: 375, height: 800 }}>
          <Banner icon={() => (
            <Image
              source={plantboxWaterer != username && plantboxWaterer !="none" ? (plantboxWaterer == "Anna" ? require('./assets/avatar-user01.png') : require('./assets/avatar-user02.png')): (log1.split("_")[1] == "02" ? require('./assets/avatar-user01.png') : require('./assets/avatar-user02.png'))}
              style={{ width: 40, height: 40 }} />)}
            style={{ fontSize: 32, backgroundColor: theme.colors.banner }} visible={bannerVisible}
            actions={[{ label: "Got it, thanks", onPress: () => setBannerVisible(false), },]}>
            H E Y  {username == "Anna" ? " A N N A" : "K A T H R I N"} {"\n"}
            {displayMessage()}
          </Banner>

          <ScrollView style={{ marginHorizontal: 8 }}>

            <Portal>
              <Dialog style={{ backgroundColor: theme.colors.primary }} visible={connectionErrorDialogVisible} onDismiss={hideConnectionErrorDialog}>
                <Dialog.Title style={{ fontSize: 24, color: '#FFFFFF' }}>Couldn't connect to {plantboxOwner == username ? 'your Plants' : plantboxOwner + "'s Plants"} 👀</Dialog.Title>
                <Dialog.Content>
                  <Paragraph style={{ color: '#FFFFFF' }}>Your coaster seems to be offline. Make sure it is connected to the power supply.</Paragraph>
                </Dialog.Content>
                <Dialog.Actions>
                  <Button color='#FFFFFF' onPress={hideConnectionErrorDialog}>Got it, thanks</Button>
                </Dialog.Actions>
              </Dialog>
            </Portal>

            <Portal>
              <Dialog style={{ backgroundColor: theme.colors.primary }} visible={connectionCancelDialogVisible} onDismiss={declineCoasterDisconnection}>
                <Dialog.Title style={{ fontSize: 24, color: '#FFFFFF' }}>You sure you wanna disconnect? </Dialog.Title>
                <Dialog.Content>
                  <Paragraph style={{ color: '#FFFFFF' }}>You are currently in charge of watering. Still want to proceed? </Paragraph>
                </Dialog.Content>
                <Dialog.Actions style={{ paddingBottom: 16, paddingRight: 24 }}>
                  <Button color='#FFFFFF' style={{ marginRight: 52 }} onPress={declineCoasterDisconnection}>Nevermind</Button>
                  <Button color='#FFFFFF' mode="outlined" style={{ backgroundColor: theme.colors.accent }} onPress={confirmCoasterDisconnection}>Disconnect </Button>
                </Dialog.Actions>
              </Dialog>
            </Portal>

            <Portal>
              <Dialog style={{ backgroundColor: theme.colors.primary }} visible={connectionErrorDialogVisible} onDismiss={hideConnectionErrorDialog}>
                <Dialog.Title style={{ fontSize: 24, color: '#FFFFFF' }}>Couldn't connect to {plantboxOwner == username ? 'your Plants' : plantboxOwner + "'s Plants"} 👀</Dialog.Title>
                <Dialog.Content>
                  <Paragraph style={{ color: '#FFFFFF' }}>Your coaster seems to be offline. Make sure it is connected to the power supply.</Paragraph>
                </Dialog.Content>
                <Dialog.Actions>
                  <Button color={'#FFFFFF'} onPress={hideConnectionErrorDialog}>Got it, thanks</Button>
                </Dialog.Actions>
              </Dialog>
            </Portal>

            <Portal>
              <Dialog style={{ backgroundColor: theme.colors.primary }} visible={connectionCancelDialogVisible} onDismiss={declineCoasterDisconnection}>
                <Dialog.Title style={{ fontSize: 24, color: '#FFFFFF' }}>You sure you wanna disconnect? </Dialog.Title>
                <Dialog.Content>
                  <Paragraph style={{ color: '#FFFFFF' }}>You are currently in charge of watering. Still want to proceed? </Paragraph>
                </Dialog.Content>
                <Dialog.Actions style={{ paddingBottom: 16, paddingRight: 24 }}>
                  <Button color={'#FFFFFF'} style={{ marginRight: 52 }} onPress={declineCoasterDisconnection}>Nevermind</Button>
                  <Button color='#FFFFFF' mode="outlined" style={{ backgroundColor: theme.colors.accent }} onPress={confirmCoasterDisconnection}>Disconnect </Button>
                </Dialog.Actions>
              </Dialog>
            </Portal>

            <Portal>
              <Dialog style={{ backgroundColor: theme.colors.primary }} visible={plantboxOfflineDialogVisible} onDismiss={hidePlantboxOfflineDialog}>
                <Dialog.Title style={{ fontSize: 24, color: '#FFFFFF' }}>Lost connection to {plantboxOwner == username ? 'your Plants' : plantboxOwner + "'s Plants"} 🔌</Dialog.Title>
                <Dialog.Content>
                  <Paragraph style={{ color: '#FFFFFF' }}>Your Coaster was removed from {plantboxOwner == username ? 'your Plants' : plantboxOwner + "'s Plants"}. </Paragraph>
                </Dialog.Content>
                <Dialog.Actions style={{ paddingBottom: 16, paddingRight: 24 }}>
                  <Button color={'#FFFFFF'} onPress={hidePlantboxOfflineDialog}>Got it, thanks</Button>
                </Dialog.Actions>
              </Dialog>
            </Portal>

            <Portal>
              <Dialog style={{ backgroundColor: theme.colors.primary }} visible={coasterOfflineDialogVisible} onDismiss={hideCoasterOfflineDialog}>
                <Dialog.Title style={{ fontSize: 24, color: '#FFFFFF' }}>Lost connection to your Coaster 🔌</Dialog.Title>
                <Dialog.Content>
                  <Paragraph style={{ color: '#FFFFFF' }}>Your Coaster was removed from {plantboxOwner == username ? 'your Plants' : plantboxOwner + "'s Plants"}. </Paragraph>
                </Dialog.Content>
                <Dialog.Actions style={{ paddingBottom: 16, paddingRight: 24 }}>
                  <Button color={'#FFFFFF'} onPress={hideCoasterOfflineDialog}>Got it, thanks</Button>
                </Dialog.Actions>
              </Dialog>
            </Portal>

            <Card style={{ marginTop: 40 }}>
              {!plantboxActive ? (
                <Card.Content style={{ borderTopLeftRadius: 4, borderTopRightRadius: 4, backgroundColor: theme.colors.accent, marginTop: 0, marginBottom: 0, paddingBottom: 0, paddingTop: 2, paddingLeft: 8 }}>
                  <Paragraph style={{ color: "#FFFFFF", fontWeight: "bold" }}>{"Last seen " + analyzeTimeStamp(lastSeenDate, lastSeenTime)} </Paragraph>
                </Card.Content>) : null}
              <Card.Cover style={{ opacity: plantboxActive ? 1 : 0.5 }} source={require('./assets/plantbox-img.jpg')} />
              <Card.Content style={{ opacity: plantboxActive ? 1 : 0.5, marginTop: 16, marginBottom: 0, paddingBottom: 0 }}>

                <Title>{plantboxOwner == username ? 'My Plants' : plantboxOwner + "'s Plants"}</Title>
                <View style={{ flexDirection: 'row', justifyContent: "space-between", alignItems: "center" }}>
                  <IconButton color={displayStatus(plantboxMoisture)} icon="watering-can" size={44}></IconButton>
                  <IconButton color={displayStatus(plantboxTank)} icon="cup-water" size={40}></IconButton>
                  <IconButton style={{ backgroundColor: "FAFAFA" }} icon="circle-slice-8" color={coasterPlantbox == "true" && coasterActive ? theme.colors.accent : '#FFFFFF'} size={44} onPress={changeCoasterConnection} />
                </View>
              </Card.Content>
              {plantboxWaterer !== empty ? <ProgressBar indeterminate={true} color={theme.colors.primary} /> : null}
            </Card>

            <Card style={{ marginTop: 24 }}>
              <Card.Title title="What's new?" style={{ marginTop: 16 }} />
              <Card.Content style={{ marginTop: 16, marginBottom: 8 }}>
                <View style={{ flexDirection: 'row', justifyContent: "space-between", alignItems: "center" }}>
                  <View style={{ flexDirection: 'row', alignItems: "center", height: 36 }}>
                    {log1.split("_")[0] == "T" ? <Paragraph>{log1.split("_")[1] == "02" ? "Anna" : "Kathrin"} says thanks for watering! </Paragraph> : <Paragraph>{log1.split("_")[1] == "02" ? "Anna" : "Kathrin"} watered your Plants</Paragraph>}
                    {log1.split("_").length == 5 ? <IconButton style={{ alignSelf: "center" }} color={log1.split("_")[4] == "false" ? theme.colors.text : theme.colors.primary} onPress={log1.split("_")[4] == "false" ? () => sayThanks(log1, "log1") : null} icon={log1.split("_")[4] == "false" ? "heart-outline" : "heart"} size={16}></IconButton> : null}
                  </View>
                  <Paragraph>{analyzeTimeStamp(log1.split("_")[2], log1.split("_")[3])}</Paragraph>
                </View>
                <View style={{ marginTop: 16, flexDirection: 'row', justifyContent: "space-between", alignItems: "center", height: 36 }}>
                  <View style={{ flexDirection: 'row', alignItems: "center" }}>
                    {log2.split("_")[0] == "T" ? <Paragraph>{log2.split("_")[1] == "02" ? "Anna" : "Kathrin"} says thanks for watering! </Paragraph> : <Paragraph>{log2.split("_")[1] == "02" ? "Anna" : "Kathrin"} watered your Plants</Paragraph>}
                    {log2.split("_").length == 5 ? <IconButton style={{ alignSelf: "center" }} color={log2.split("_")[4] == "false" ? theme.colors.text : theme.colors.primary} onPress={log2.split("_")[4] == "false" ? () => sayThanks(log2, "log2") : null} icon={log2.split("_")[4] == "false" ? "heart-outline" : "heart"} size={16}></IconButton> : null}
                  </View>
                  <Paragraph>{analyzeTimeStamp(log2.split("_")[2], log2.split("_")[3])}</Paragraph>
                </View>
                <View style={{ marginTop: 16, flexDirection: 'row', justifyContent: "space-between", alignItems: "center", height: 36 }}>
                  <View style={{ flexDirection: 'row', alignItems: "center" }}>
                    {log3.split("_")[0] == "T" ? <Paragraph>{log3.split("_")[1] == "02" ? "Anna" : "Kathrin"} says thanks for watering! </Paragraph> : <Paragraph>{log3.split("_")[1] == "02" ? "Anna" : "Kathrin"} watered your Plants</Paragraph>}
                    {log3.split("_").length == 5 ? <IconButton style={{ alignSelf: "center" }} color={log3.split("_")[4] == "false" ? theme.colors.text : theme.colors.primary} onPress={log3.split("_")[4] == "false" ? () => sayThanks(log3, "log3") : null} icon={log3.split("_")[4] == "false" ? "heart-outline" : "heart"} size={16}></IconButton> : null}
                  </View>
                  <Paragraph>{analyzeTimeStamp(log3.split("_")[2], log3.split("_")[3])}</Paragraph>
                </View>
              </Card.Content>
            </Card>
          </ScrollView>
        </ImageBackground >

      ) : null}

    </PaperProvider >

  );
};

export default App;

const theme = {
  ...DefaultTheme,
  roundness: 4,
  colors: {
    ...DefaultTheme.colors,
    banner: '#d8f2ea',
    accent: '#003d2b',
    primary: '#5b8c7e',
    background: '#ECF9F2',
    surface: '#FFFFFF',
    text: '#2B2D34',
    high: '#AFCCA9',
    medium: "#f9e2ac",
    low: "#CC8888"
  },
};
