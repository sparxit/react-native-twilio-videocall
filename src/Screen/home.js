import React from "react";
import { SafeAreaView } from "react-native";
import MeetingCall from "../Component/MeetingCall";
import { accessToken, roomId } from "../Utils/String";

const twilioToken = 'eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiIsImN0eSI6InR3aWxpby1mcGE7dj0xIn0.eyJqdGkiOiJTSzI2Yzc3MWJhYWQ5Y2I1MTRjMDlkZTA3NmQ5NDAxYjM5LTE2ODk5MzQyNDIiLCJpc3MiOiJTSzI2Yzc3MWJhYWQ5Y2I1MTRjMDlkZTA3NmQ5NDAxYjM5Iiwic3ViIjoiQUM2MWU5YTFmNTVmYmVkNTRiODdlOGZmNzE5NzAyYWVhOSIsImV4cCI6MTY4OTkzNzg0MiwiZ3JhbnRzIjp7ImlkZW50aXR5IjoiY2xpZW50SWRfMDAyIiwidmlkZW8iOnsicm9vbSI6InRlc3RSb29tMDEifX19.evf1PssM3TO7nMnW0_MFuOmw1oU87bOSTPIInnl7nXE'
const twilioRoomId = 'testRoom01'
const participantId = 'clientId_002'

const Home = (props) => {

    return (
        <SafeAreaView style={{ flex: 1,backgroundColor:'red' }}>
            <MeetingCall
                twilioRoomId={twilioRoomId}
                twilioToken={twilioToken}
                participantId={participantId}
            />
        </SafeAreaView>
    );
};

export default Home;