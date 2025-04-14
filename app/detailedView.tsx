import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, Image, FlatList } from 'react-native';
import { useRoute } from '@react-navigation/native';
// or if using expo-router: import { useLocalSearchParams } from 'expo-router';
import { collection, query, where, orderBy, Timestamp, getDocs } from 'firebase/firestore';
import { db } from '../config/firebaseConfig'; // Adjust as needed
import Ionicons from '@expo/vector-icons/Ionicons';

interface ReportDoc {
    id: string;
    crowdLevel: number | string;
    userName?: string;
    timestamp: any;       // Firestore timestamp
    additionalInfo?: string;
    photoUrl?: string;
}

const crowdColors: Record<number, string> = {
    0: 'green',
    1: 'yellow',
    2: 'red',
};

// Example predicted crowd data (dummy). Adjust as needed.
const predictedTimes = [
    { label: 'prev', crowdLevel: 0 },
    { label: 'Now', crowdLevel: 1 },
    { label: '2:30 pm', crowdLevel: 2 },
    { label: '3:00 pm', crowdLevel: 1 },
    { label: '3:30 pm', crowdLevel: 0 },
    { label: '4:00 pm', crowdLevel: 0 },
];

export default function DetailedView() {
    // Suppose we get `locationId` and `locationName` from route params:
    const route = useRoute();
    const { locationId, locationName } = route.params as {
        locationId: string;
        locationName: string;
    };

    const [recentReports, setRecentReports] = useState<ReportDoc[]>([]);
    const [mostRecentCrowdLevel, setMostRecentCrowdLevel] = useState<number | null>(null);

    // On mount, load the recent reports for the last 2 hours
    useEffect(() => {
        (async () => {
            try {
                const now = Date.now();
                const twoHoursAgo = new Date(now - 2 * 60 * 60 * 1000);
                // Firestore timestamp for filtering
                const minTimestamp = Timestamp.fromDate(twoHoursAgo);

                const q = query(
                    collection(db, 'reports'),
                    where('locationReported.id', '==', locationId),
                    where('timestamp', '>', minTimestamp),
                    orderBy('timestamp', 'desc')
                );

                const querySnap = await getDocs(q);
                const docs: ReportDoc[] = [];
                querySnap.forEach((docSnap) => {
                    const data = docSnap.data();
                    docs.push({
                        id: docSnap.id,
                        crowdLevel: data.crowdLevel,            // numeric or string
                        userName: data.userName || 'Anonymous', // if stored
                        timestamp: data.timestamp,
                        additionalInfo: data.additionalInfo,
                        photoUrl: data.photoUrl,
                    });
                });

                setRecentReports(docs);

                // If there's at least one report, set the most recent crowd level
                if (docs.length > 0) {
                    const firstReport = docs[0];
                    // If crowdLevel is numeric or string. Convert if needed:
                    const level = typeof firstReport.crowdLevel === 'string'
                        ? parseCrowdStringToNumber(firstReport.crowdLevel)
                        : firstReport.crowdLevel;
                    setMostRecentCrowdLevel(level);
                }
            } catch (err) {
                console.error('Error loading recent reports:', err);
            }
        })();
    }, [locationId]);

    // Helper: convert strings like "not crowded" into numeric levels if needed
    function parseCrowdStringToNumber(crowdStr?: string | number) {
        if (typeof crowdStr === 'number') return crowdStr;
        switch (crowdStr) {
            case 'not crowded':
                return 0;
            case 'somewhat crowded':
                return 1;
            case 'very crowded':
                return 2;
            default:
                return 0;
        }
    }

    // Format minutes since posted
    function minutesSince(timestamp: any) {
        const now = Date.now();
        const posted = timestamp.toDate().getTime();
        const diffMinutes = Math.floor((now - posted) / 60000);
        return diffMinutes;
    }

    // crowdLevel -> text (like "Somewhat busy")
    function crowdLevelText(level: number | null) {
        if (level === 0) return 'Not busy';
        if (level === 1) return 'Somewhat busy';
        if (level === 2) return 'Very busy';
        return 'Unknown';
    }

    return (
        <View style={styles.container}>
            {/* Title area */}
            <View style={styles.header}>
                <Text style={styles.title}>{locationName || 'Location'} </Text>
                <Text style={styles.subtitle}>
                    {mostRecentCrowdLevel !== null ? crowdLevelText(mostRecentCrowdLevel) : 'No recent data'}
                </Text>
            </View>

            {/* Prediction Graph */}
            <View style={styles.predictionContainer}>
                <Text style={styles.predictionHeading}>predicted activity levels</Text>
                <View style={styles.predictionRow}>
                    {predictedTimes.map((pt, i) => (
                        <View key={i} style={styles.predictionItem}>
                            <Ionicons
                                name="ellipse"
                                size={24}
                                color={crowdColors[pt.crowdLevel] || 'gray'}
                            />
                            <Text style={styles.predictionLabel}>{pt.label}</Text>
                        </View>
                    ))}
                </View>
            </View>

            {/* Recent Reports */}
            <Text style={styles.reportsHeading}>Recent Reports</Text>
            <FlatList
                style={styles.reportsList}
                data={recentReports}
                keyExtractor={(item) => item.id}
                renderItem={({ item }) => {
                    const minSince = minutesSince(item.timestamp);
                    const cLevel = parseCrowdStringToNumber(item.crowdLevel);
                    return (
                        <View style={styles.reportCard}>
                            {/* Row with userName/time since */}
                            <View style={styles.reportTopRow}>
                                <Text style={styles.reportUser}>{item.userName}, {minSince}m ago</Text>
                                <Ionicons
                                    name="ellipse"
                                    size={18}
                                    color={crowdColors[cLevel] || 'gray'}
                                />
                            </View>
                            {/* Additional info text */}
                            {item.additionalInfo ? (
                                <Text style={styles.reportText}>"{item.additionalInfo}"</Text>
                            ) : null}
                            {/* Photo if exists */}
                            {item.photoUrl ? (
                                <Image source={{ uri: item.photoUrl }} style={styles.reportImage} />
                            ) : null}
                        </View>
                    );
                }}
            />
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#eee',
        paddingTop: 40,
        paddingHorizontal: 20,
    },
    header: {
        marginBottom: 10,
    },
    title: {
        fontSize: 26,
        fontWeight: 'bold',
        color: '#333',
    },
    subtitle: {
        fontSize: 16,
        color: '#666',
        marginTop: 2,
    },
    predictionContainer: {
        marginVertical: 10,
        backgroundColor: '#fafafa',
        padding: 10,
        borderRadius: 8,
    },
    predictionHeading: {
        fontSize: 14,
        color: '#999',
        marginBottom: 8,
    },
    predictionRow: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-around',
    },
    predictionItem: {
        alignItems: 'center',
    },
    predictionLabel: {
        marginTop: 4,
        fontSize: 12,
        color: '#444',
    },
    reportsHeading: {
        fontSize: 16,
        fontWeight: 'bold',
        marginVertical: 8,
        color: '#333',
    },
    reportsList: {
        flex: 1,
    },
    reportCard: {
        backgroundColor: '#fff',
        marginVertical: 4,
        padding: 10,
        borderRadius: 8,
    },
    reportTopRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 4,
    },
    reportUser: {
        color: '#333',
        fontWeight: '600',
    },
    reportText: {
        color: '#555',
        fontStyle: 'italic',
        marginVertical: 4,
    },
    reportImage: {
        width: 200,
        height: 120,
        borderRadius: 8,
        marginTop: 6,
    },
});
