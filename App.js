import React, {useState} from 'react';
import {LogBox, SafeAreaView, Text, TouchableOpacity, View} from 'react-native';
import MeetingCall from './src/Component/MeetingCall';
import {accessToken, roomId, participantId} from './src/Utils/String';

LogBox.ignoreAllLogs();
const App = () => {
  const [joinStatus, setJoinStatus] = useState(false);
  return (
    <SafeAreaView style={{flex: 1, justifyContent: 'center'}}>
      {!joinStatus ? (
        <View
          style={{
            width: '100%',
            justifYContent: 'center',
            alignItems: 'center',
          }}>
          <TouchableOpacity
            style={{width: 100, height: 80}}
            onPress={() => setJoinStatus(true)}>
            <Text
              style={{
                color: 'orange',
                fontSize: 12,
                fontWeight: '900',
                textAlign: 'center',
              }}>
              Join Meeting
            </Text>
          </TouchableOpacity>
        </View>
      ) : (
        <MeetingCall
          onEndCall={() => setJoinStatus(false)}
          twilioRoomId={roomId}
          twilioToken={accessToken}
          participantId={participantId}
        />
      )}
    </SafeAreaView>
  );
};
export default App;
