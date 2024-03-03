import React, { useRef, useReducer, useEffect } from "react";
import { Stack, Text, ActionIcon, Progress, Indicator } from '@mantine/core';
import { IconPlayerPlay, IconPlayerPause } from '@tabler/icons-react';
import { Calendar } from '@mantine/dates';
import moment from 'moment';

export default function Ganhuo() {
    const lastTime = useRef(0)
    const mTimerId = useRef(0)

    useEffect(() => {
        window.app.onLockScreen((value) => {
            console.log(`web get lock screen ${value}`)

            stopPolling()
        })

        const todayDuration = getTodayDuration();
        dispatch({ type: 'setDuration', duration: todayDuration })
    }, [])

    const initState = {
        duration: 0,
        persentage: 0,
        availablePersentage: 0,
        isPolling: false,
        displayDuration: '00:00:00',
        doneDateList: []
    }

    const [mState, dispatch] = useReducer((state, action) => {
        if (action.type === 'switch') {
            if (action.mSwitch === 'on') {
                return { ...state, isPolling: true }
            } else {
                return { ...state, isPolling: false }
            }
        } else if (action.type === 'tik') {
            if (action.isWorking) {
                // console.log(action.nowUptime)
                // console.log(`上次:${lastTime.current} 本次:${action.nowUptime} 差:${action.nowUptime - lastTime.current} 上次累计:${state.duration} 本次累积:${state.duration + action.nowUptime - lastTime.current}`)
                const aDuration = action.nowUptime - lastTime.current
                lastTime.current = action.nowUptime
                const newDuration = getTodayDuration() + aDuration
                saveTodayDuration(newDuration)
                const display = moment.utc(newDuration * 1000).format('HH:mm:ss');

                if (newDuration >= 8 * 60 * 60) {
                    callWorkDoneApi()
                }

                const progress = (newDuration / (8 * 60 * 60)) * 100
                const leftProgress = leftTimeProgress()
                return { ...state, duration: newDuration, displayDuration: display, persentage: progress, availablePersentage: leftProgress }
            } else {
                lastTime.current = action.nowUptime
                notifyToWork()
                return state
            }
        } else if (action.type === 'setDuration') {
            const display = moment.utc(action.duration * 1000).format('HH:mm:ss');
            const progress = (action.duration / (8 * 60 * 60)) * 100
            const leftProgress = leftTimeProgress()
            console.log(`left ${leftProgress}`)

            const dbDate = getDataBase()
            const doneList = dbDate.filter(item => item.duration >= 8 * 60 * 60).map(item => item.date)
            console.log(`done list is ${doneList}`)

            return { ...state, duration: action.duration, displayDuration: display, persentage: progress, availablePersentage: leftProgress, doneDateList: doneList }
        }
        return state
    }, initState)

    async function startPolling() {
        console.log('click')
        dispatch({ type: 'switch', mSwitch: 'on' })
        lastTime.current = await window.app.uptime();

        mTimerId.current = setInterval(async () => {
            const nowTime = await window.app.uptime();
            const working = await window.app.isWorking();
            // console.log(`干活:${working}`)
            dispatch({ type: 'tik', nowUptime: nowTime, isWorking: working })
        }, 1000)
    }

    function stopPolling() {
        dispatch({ type: 'switch', mSwitch: 'off' })
        // lastTime.current = 0

        if (mTimerId.current !== 0) {
            clearInterval(mTimerId.current)
            mTimerId.current = 0
        }
    }

    function notifyToWork() {
        new window.Notification('干活', { body: '干活啊' })
            .onclick = () => { console.log('clicked') }
    }

    function callWorkDoneApi() {
        // todo 检查是不是调用过了 不用重复调用
        fetch('http://192.168.2.102:7771/setIsDone?value=true', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
        })
            .then(response => {
                if (!response.ok) {
                    throw new Error('Network response was not ok');
                }
                return response.text();
            })
            .then(data => {
                console.log(data);
            })
            .catch(error => {
                console.error('There has been a problem with your fetch operation:', error);
            });
    }

    function getDataBase() {
        let dbStr = localStorage.getItem('ganhuo')
        if (!dbStr) {
            dbStr = '[]'
        }
        return JSON.parse(dbStr)
    }

    function setDataBase(data) {
        const dbStr = JSON.stringify(data)
        // console.log('保存调用')
        localStorage.setItem('ganhuo', dbStr)
    }

    function dateToStr(date) {
        const formattedDate = moment(date).format('DD/MM/YYYY');
        return formattedDate
    }

    function getTodayDuration() {
        const dataBase = getDataBase()
        const today = dateToStr(new Date())
        const todayState = dataBase.find(item => item.date === today)
        if (todayState) {
            return todayState.duration
        }
        return 0
    }

    function saveTodayDuration(newDuration) {
        const database = getDataBase()
        const today = dateToStr(new Date())
        const todayState = database.find(item => item.date === today)

        if (todayState) {
            todayState.duration = newDuration
        } else {
            database.push({ date: today, duration: newDuration })
        }

        setDataBase(database)
    }

    function leftTimeProgress() {
        const currentTime = moment();
        const tomorrowMidnight = moment().endOf('day').add(1, 'second');
        const remainingSeconds = tomorrowMidnight.diff(currentTime, 'seconds');
        // console.log(`剩余${remainingSeconds}秒`)

        return (remainingSeconds / (8 * 60 * 60)) * 100
    }

    return (
        <div className="mx-10" >
            <Stack>
                <Text size="xl" fw={700} c="blue" className="mt-8">{mState.displayDuration}</Text>
                <div className="flex w-full items-center">
                    {!mState.isPolling ?
                        <ActionIcon variant="filled" aria-label="start" onClick={() => { startPolling() }}>
                            <IconPlayerPlay style={{ width: '70%', height: '70%' }} stroke={1.5} />
                        </ActionIcon> :
                        <ActionIcon variant="filled" aria-label="pause" onClick={() => { stopPolling() }}>
                            <IconPlayerPause style={{ width: '70%', height: '70%' }} stroke={1.5} />
                        </ActionIcon>}
                    <Progress.Root size="xl" className="flex-grow w-fit ml-4">
                        <Progress.Section value={mState.persentage} color="cyan" />
                        <Progress.Section value={mState.availablePersentage} color="pink" />
                    </Progress.Root>
                </div>

                <Calendar className="mx-auto mt-6"
                    static
                    renderDay={(date) => {
                        const day = date.getDate();
                        const dateStr = dateToStr(date)
                        const thisDate = mState.doneDateList.find(item => item === dateStr)
                        // console.log(`日历 ${dateStr} ${mState.doneDateList} ${thisDate}`)
                        let isDone = false
                        if (thisDate) {
                            isDone = true
                        }
                        return (
                            <Indicator size={6} color="green" offset={-2} disabled={!isDone}>
                                <div>{day}</div>
                            </Indicator>
                        );
                    }}
                />
            </Stack>

        </div>
    )
}