import React, { useEffect, useRef, useState } from "react";
import { Dimensions, FlatList, Image, Platform, SafeAreaView, Text, TouchableOpacity, View } from "react-native";
import { check } from "react-native-permissions";
import { TwilioVideo, TwilioVideoLocalView, TwilioVideoParticipantView } from "react-native-twilio-video-webrtc";
import { backIcon, cameraBack, end, mute, muteVideo, videoOn, videoPaused } from "../Utils/icon";


const { width } = Dimensions.get('screen');

let isPermissionGrant = false;


const MeetingCall = (props) => {
    const { twilioRoomId, twilioToken, participantId, onEndCall } = props;

    // State
    const [token, setToken] = useState(twilioToken);
    const [roomName, setRoomName] = useState(twilioRoomId);
    const [isAudioEnabled, setIsAudioEnabled] = useState(true);
    const [videoTracks, setVideoTracks] = useState([]);
    const [isParticipentAdd, setIsParticipentAdd] = useState(false);
    const [video, setVideo] = useState(true);
    const [flip, setFlip] = useState(true);
    const [isLocalViewMain, setIsLocalViewMain] = useState(false)
    const twilioRef = useRef(null);

    const localViewRef = useRef(null);
    const [isUpdate, setIsUpdate] = useState(0);


    // UseEffect
    useEffect(() => {
        checkPermission();
    }, [isUpdate])

    const funcCalling = async () => {
        await setVideo(true);
        await connectToRoom(roomName, participantId);
    }

    const checkPermission = async () => {

        // camera permission 
        const permissions =
            Platform.OS == 'ios'
                ? 'ios.permission.CAMERA'
                : 'android.permission.CAMERA';
        const isGrant = await check(permissions);

        // microphone permission
        const permission2 =
            Platform.OS == 'ios'
                ? 'ios.permission.MICROPHONE'
                : 'android.permission.RECORD_AUDIO';
        const isGranted = await check(permission2);

        // media permission
        if (Platform.OS == 'android' && Platform.Version < 28) {

            const permissions3 =
                Platform.OS == 'ios'
                    ? 'ios.permission.PHOTO_LIBRARY'
                    : 'android.permission.READ_EXTERNAL_STORAGE';
            const isMediaGrant = await check(permissions3);

            //  check permission is granted or not 
            if (isGrant == 'granted' && isGranted == 'granted' && isMediaGrant == 'granted') {
                isPermissionGrant = true;
                if (isPermissionGrant) {
                    if (isUpdate === 0)
                        funcCalling();
                }
                else {
                }
            } else {
                isPermissionGrant = false;
            }
        } else {
            //  check permission is granted or not 
            if (isGrant == 'granted' && isGranted == 'granted') {
                isPermissionGrant = true;
                // await setIsPermissionGranted(true);
                if (isPermissionGrant) {
                    console.log('is in on media else part----');
                    if (isUpdate === 0)
                        funcCalling();
                }
            } else {
                isPermissionGrant = false;
            }
        }

    };

    const connectToRoom = async (roomName, participantName) => {
        const twilioToken = token;
        setIsParticipentAdd(true);
        try {
            await twilioRef.current.connect({
                accessToken: twilioToken,
                roomName,
                participantName,
                enableVideo: true
            });
            console.log('Connected to the video room successfully!');
        } catch (error) {
            console.log(error);
        }

    };


    const _onMuteButtonPress = () => {
        twilioRef.current
            .setLocalAudioEnabled(!isAudioEnabled)
            .then((isEnabled) => setIsAudioEnabled(isEnabled));
    };

    // handle pause the video
    const onhandlePauseLocalVideo = () => {
        twilioRef.current.setLocalVideoEnabled(!video).then(isEnabled => {
            setVideo(isEnabled), console.log('isEnabled---', isEnabled);
        });
    };

    // handle flip camera
    const _onFlipButtonPress = () => {
        if (video) {
            twilioRef.current.flipCamera();
            setFlip(!flip);
        }
    };

    const _onRoomDidConnect = ({ roomName, error }) => {
        console.log("onRoomDidConnect: ", roomName);
    };

    const _onRoomDidDisconnect = ({ roomName, error }) => {
        console.log("[Disconnect]ERROR: ", error, roomName);
    };

    const _onRoomDidFailToConnect = (error) => {
        console.log("[FailToConnect]ERROR: ", error);
    };

    const _onParticipantAddedVideoTrack = ({ participant, track }) => {
        console.log("onParticipantAddedVideoTrack: ", participant, track);
        setIsParticipentAdd(true);
        setVideoTracks([
            ...videoTracks,
            { participantSid: participant.sid, videoTrackSid: track.trackSid, local: false }
        ]);

    };


    const _onParticipantRemovedVideoTrack = ({ participant, track }) => {
        const videoTracksLocal = videoTracks;
        console.log("onParticipantRemovedVideoTrack: ", videoTracksLocal.length);
        if (videoTracksLocal.length <= 1) {
            setIsParticipentAdd(false);
            console.log('switched into false');
        }
        let result = videoTracksLocal.filter((i) => {
            return i.participantSid != participant.sid
        })
        console.log('videoTracksLocalvideoTracksLocal---', result);
        setVideoTracks(result);

        let secResult = videoTracks.filter((i, ind) => {
            return ind == 0;
        })

        console.log('secResult--', secResult);
    };

    const _onParticipantAddeAudioTrack = ({ participant, track }) => {
        console.log('_onParticipantAddeAudioTrack: ', participant, track);
        setIsParticipentAdd(true);
    };

    // check participent audio remove track
    const _onParticipantRemovedAudioTrack = ({ participant, track }) => {
        console.log('_onParticipantRemovedAudioTrack', participant);

        setIsParticipentAdd(false);
    };

    const _onNetworkLevelChanged = ({ participant, isLocalUser, quality }) => {
        console.log(
            'Participant is---',
            participant,
            'isLocalUser',
            isLocalUser,
            'quality',
            quality,
        );

        if (quality == 1 || quality == 2) {
            toast('Bad connection,Please check your internet ');
        }
    };

    const _onParticipantAddedDataTrack = ({ participant, trackId }) => {
        console.log('_onParticipantAddedDataTrack:--', participant, trackId);
    }

    const replaceView = async (i, ind) => {
        console.log('old array is---', videoTracks)
        const temp = videoTracks;
        const objectToSwipe = temp.splice(ind, 1)[0];
        if (isLocalViewMain) {
            setIsLocalViewMain(false)
        }
        temp.splice(0, 0, objectToSwipe);

        console.log('new array', temp);
        setIsUpdate(Math.random(10))

        setVideoTracks(temp)



        // }
    };

    const renderParticipentView = (i, index) => {


        return (index > 0) && (
            <View
                style={{
                    height: 170,
                    width: width / 2.8,
                    overflow: 'hidden',
                    backgroundColor: 'transparent',
                    marginHorizontal: 5
                }}
            >
                <TouchableOpacity
                    key={i.participantSid}
                    onPress={() => {
                        replaceView(i, index);
                    }}
                    style={{
                        height: '100%',
                        width: '100%',
                    }}>

                    <TwilioVideoParticipantView
                        applyZOrder={true}
                        style={{
                            width: '100%',
                            height: '100%',
                            marginRight: 10
                        }}
                        key={i.videoTrackSid}
                        trackIdentifier={i}
                    />
                </TouchableOpacity>

            </View>
        )



    };

    const ListHeaderComponent = () => {
        let myData = [];
        if (videoTracks.length > 0) {
            myData = videoTracks[0]
        }

        return !isLocalViewMain ? (
            <TouchableOpacity
                onPress={() => setIsLocalViewMain(true)}
                style={{ height: 170, width: width / 2.8 }}>
                <TwilioVideoLocalView
                    applyZOrder={false}
                    style={{
                        height: '100%',
                        width: '100%',
                    }}
                    enabled={true}
                    ref={localViewRef}
                >
                </TwilioVideoLocalView>
            </TouchableOpacity>
        ) : (<TouchableOpacity
            onPress={() => setIsLocalViewMain(false)}
            style={{ height: 170, width: width / 2.8 }}>
            <TwilioVideoParticipantView
                applyZOrder={false}
                style={{
                    width: '100%',
                    height: '100%',
                    marginRight: 10
                }}
                key={myData.videoTrackSid}
                trackIdentifier={myData}
            />
        </TouchableOpacity>)
    };

    const RenderMainView = () => {
        let myData = [];
        if (videoTracks.length > 0) {
            myData = videoTracks[0]
        }

        return !isLocalViewMain ? (
            <View style={{
                flex: 1,
                width: '100%'
            }}>
                <TwilioVideoParticipantView
                    applyZOrder={false}
                    style={{
                        width: '100%',
                        height: '100%',
                        marginRight: 10
                    }}
                    key={myData.videoTrackSid}
                    trackIdentifier={myData}
                />
            </View>
        ) : (
            <View style={{
                flex: 1,
                width: '100%'
            }}>
                <TwilioVideoLocalView
                    applyZOrder={false}
                    style={{
                        height: '100%',
                        width: '100%',
                    }}
                    enabled={true}
                    ref={localViewRef}
                >
                </TwilioVideoLocalView>
            </View>
        )
    };

    return (
        <SafeAreaView style={{
            flex: 1,
            backgroundColor: 'black'
        }}>

            {/* Header */}
            <View style={{
                height: 50,
                width: '100%',
                justifyContent: 'center',
                alignItems: 'center',
                backgroundColor: 'black',
                flexDirection: 'row',
            }}>

                <Text style={{
                    color: 'orange',
                    fontSize: 20,
                    fontWeight: '800',
                }}
                >
                    {'Meeting Room'}
                </Text>

                <TouchableOpacity
                    onPress={async () => {
                        await twilioRef.current.disconnect()
                        onEndCall()
                    }}
                    style={{
                        position: 'absolute',
                        left: 5,
                        justifyContent: 'center',
                        alignItems: 'center'
                    }}>
                    <Image
                        style={{
                            height: 25,
                            width: 25,
                            tintColor: 'orange'
                        }}
                        resizeMode="contain"
                        source={backIcon}
                    />
                </TouchableOpacity>

            </View>

            <View
                style={{
                    flex: 1,
                    width: width,
                }}
            >

                {/* Local Participent */}
                <View
                    style={{
                        width: '100%',
                        height: '100%',
                    }}>
                    {videoTracks.length > 0 ?
                        (<RenderMainView />) : (
                            <View style={{
                                height: '100%',
                                width: '100%',
                                overflow: 'hidden',
                                marginHorizontal: 5,
                                justifyContent: 'center',
                                alignItems: 'center',
                                borderRadius: 10,
                                backgroundColor: 'black'

                            }}>
                                {console.log('switched into waiting view')}
                                <Text
                                    numberOfLines={1}
                                    style={{
                                        color: 'white',
                                        fontSize: 20,
                                        alignSelf: 'center',
                                    }}>
                                    {'Waiting for Participent to join'}
                                </Text>
                            </View>
                        )}

                    {/* Mute .unmute ,video pause button  */}
                    <View
                        style={{
                            position: 'absolute',
                            bottom: 20,
                            width: '85%',
                            justifyContent: 'space-between',
                            alignSelf: 'center',
                            alignItems: 'center',
                            flexDirection: 'row',
                            backgroundColor: 'transparent',
                        }}>

                        <TouchableOpacity
                            style={{
                                width: 50,
                                height: 50,
                                borderRadius: 100 / 2,
                            }}
                            onPress={async () => {
                                await twilioRef.current.disconnect();
                                onEndCall()
                            }}>
                            <Image
                                style={{ width: 50, height: 50, borderRadius: 25 }}
                                source={end}
                            />
                        </TouchableOpacity>

                        <TouchableOpacity
                            activeOpacity={0.8}
                            style={{
                                width: 50,
                                height: 50,
                                borderRadius: 50 / 2,
                                backgroundColor: 'white'
                            }}
                            onPress={() => {
                                onhandlePauseLocalVideo();
                            }}>
                            <Image
                                style={{
                                    width: 50,
                                    height: 50,
                                    borderRadius: 50 / 2,
                                    // tintColor: Colors.grey,
                                }}
                                resizeMode={'contain'}
                                source={video ? videoOn : videoPaused}
                            />
                        </TouchableOpacity>

                        <TouchableOpacity
                            style={{
                                width: 50,
                                height: 50,
                                borderRadius: 50 / 2,
                                backgroundColor: 'white',
                            }}
                            activeOpacity={0.8}
                            onPress={() => {
                                _onFlipButtonPress()
                            }}>
                            <Image
                                style={{ width: 50, height: 50, borderRadius: 50 / 2 }}
                                source={
                                    cameraBack
                                }
                                resizeMode={'contain'}
                            />

                            {/* <Text style={{ fontSize: 12 }}>Flip</Text> */}
                        </TouchableOpacity>

                        <TouchableOpacity
                            style={{
                                width: 50,
                                height: 50,
                                borderRadius: 50 / 2,
                            }}
                            onPress={_onMuteButtonPress}>
                            <Image
                                resizeMode={'contain'}
                                style={{ width: 50, height: 50, borderRadius: 50 / 2 }}
                                source={isAudioEnabled ? muteVideo : mute}
                            />
                        </TouchableOpacity>
                    </View>

                </View>


                <View
                    style={{
                        width: '100%',
                        // height: 180,
                        position: 'absolute',
                        top: 15,
                        paddingHorizontal: 10,
                        overflow: 'hidden',
                    }}
                >
                    {console.log('videoTracks--', videoTracks)}
                    {(isParticipentAdd && videoTracks.length > 0) ? (
                        <FlatList
                            horizontal
                            showsHorizontalScrollIndicator={false}
                            data={videoTracks}
                            renderItem={({ item, index }) => renderParticipentView(item, index)}
                            ListHeaderComponent={<ListHeaderComponent />}
                            ListHeaderComponentStyle={{
                                marginHorizontal: 5
                            }}
                        />
                    ) : (
                        <View style={{
                            height: 170,
                            width: width / 2.8,
                            overflow: 'hidden',
                            marginHorizontal: 5,
                            justifyContent: 'center',
                            alignItems: 'center',
                            backgroundColor: 'black'

                        }}>
                            <TwilioVideoLocalView
                                applyZOrder={false}
                                style={{
                                    height: '100%',
                                    width: '100%',
                                }}
                                enabled={true}
                                ref={localViewRef}
                            >
                            </TwilioVideoLocalView>
                        </View>
                    )}
                    {/* <View style = {{
            position:'absolute',
            backgroundColor:'red',
            height:200,
            width:200,
            top:20,
            left:20
          }}>

          </View> */}

                </View>


            </View>
            {!isPermissionGrant && <View style={{ backgroundColor: 'black', position: 'absolute', bottom: 100, alignSelf: 'center', paddingHorizontal: 10 }}>
                <Text style={{
                    fontSize: 20,
                    color: 'white',
                    fontWeight: '700',
                    textAlign: 'center'
                }}>
                    {'No Permission for Audio and Video'}
                </Text>
            </View>
            }
            <TwilioVideo
                ref={twilioRef}
                onRoomDidConnect={_onRoomDidConnect}
                onRoomDidDisconnect={_onRoomDidDisconnect}
                onRoomDidFailToConnect={_onRoomDidFailToConnect}
                onParticipantAddedAudioTrack={_onParticipantAddeAudioTrack}
                onParticipantRemovedAudioTrack={_onParticipantRemovedAudioTrack}
                onNetworkQualityLevelsChanged={_onNetworkLevelChanged}
                onParticipantAddedVideoTrack={_onParticipantAddedVideoTrack}
                onParticipantRemovedVideoTrack={_onParticipantRemovedVideoTrack}
                onParticipantAddedDataTrack={_onParticipantAddedDataTrack}

            />

        </SafeAreaView>
    )
}

export default MeetingCall;



