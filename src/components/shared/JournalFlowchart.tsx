import React from 'react';
import { Models } from 'appwrite';
import SmartImage from './SmartImage';

interface JournalFlowchartProps {
  activities: Models.Document[];
  journalTitle?: string;
  source?: string;
  destination?: string;
}

const JournalFlowchart: React.FC<JournalFlowchartProps> = ({
  activities,
  journalTitle,
  source,
  destination
}) => {  // Group activities by day
  const activitiesByDay = activities.reduce((acc, activity) => {
    const day = activity.dayNumber;
    if (!acc[day]) {
      acc[day] = [];
    }
    acc[day].push(activity);
    return acc;
  }, {} as Record<number, Models.Document[]>);

  const sortedDays = Object.keys(activitiesByDay).map(Number).sort((a, b) => a - b);

  if (sortedDays.length === 0) {
    return (
      <div className="w-full bg-dark-3 rounded-xl p-6">
        <div className="flex flex-col items-center justify-center py-8">
          <img
            src="/assets/icons/posts.svg"
            alt="no activities"
            width={48}
            height={48}
            className="opacity-50"
          />
          <h3 className="h3-bold text-light-2 mt-4">No Activities Yet</h3>
          <p className="body-medium text-light-4 mt-2 text-center">
            Add daily activities to see your travel flowchart
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full bg-dark-3 rounded-xl p-6">
      {/* Header */}
      <div className="flex flex-col gap-4 mb-8">
        <div className="flex items-center gap-3">
          <img
            src="/assets/icons/wallpaper.svg"
            alt="flowchart"
            width={24}
            height={24}
          />
          <h2 className="h2-bold text-light-1">Journey Flowchart</h2>
        </div>
        
        {journalTitle && (
          <h3 className="h3-bold text-light-2">{journalTitle}</h3>
        )}
        
        {source && destination && (
          <div className="flex items-center gap-2 text-light-3">
            <span className="body-medium">{source}</span>
            <img
              src="/assets/icons/wallpaper.svg"
              alt="arrow"
              width={16}
              height={16}
              className="rotate-90"
            />
            <span className="body-medium">{destination}</span>
          </div>
        )}
      </div>

      {/* Flowchart */}
      <div className="relative">
        {sortedDays.map((day, dayIndex) => (
          <div key={day} className="relative">
            {/* Day Header */}
            <div className="flex items-center gap-4 mb-6">
              <div className="flex-shrink-0 w-12 h-12 bg-primary-500 rounded-full flex items-center justify-center">
                <span className="body-bold text-white">{day}</span>
              </div>
              <div className="flex flex-col">
                <h4 className="h4-bold text-light-1">Day {day}</h4>
                <p className="small-medium text-light-3">
                  {activitiesByDay[day].length} {activitiesByDay[day].length === 1 ? 'activity' : 'activities'}
                </p>
              </div>
            </div>

            {/* Activities for this day */}
            <div className="ml-6 border-l-2 border-dark-4 pl-6 pb-8">
              <div className="space-y-6">
                {activitiesByDay[day].map((activity) => (
                  <div
                    key={activity.$id}
                    className="relative bg-dark-2 rounded-lg p-4 shadow-lg"
                  >
                    {/* Activity indicator dot */}
                    <div className="absolute -left-[34px] top-4 w-4 h-4 bg-primary-600 rounded-full border-2 border-dark-3"></div>
                    
                    <div className="flex gap-4">
                      {/* Activity Image */}
                      <div className="flex-shrink-0">
                        <SmartImage
                          src={activity.imageUrl}
                          imageId={activity.imageId}
                          alt="activity"
                          className="w-20 h-20 rounded-lg object-cover"
                          fallbackSrc="/assets/icons/gallery-add.svg"
                        />
                      </div>
                      
                      {/* Activity Details */}
                      <div className="flex-1 min-w-0">
                        <h5 className="base-semibold text-light-1 mb-2 line-clamp-2">
                          {activity.caption}
                        </h5>
                        
                        {activity.location && (
                          <div className="flex items-center gap-2 mb-2">
                            <img
                              src="/assets/icons/wallpaper.svg"
                              alt="location"
                              width={14}
                              height={14}
                              className="opacity-70"
                            />
                            <span className="small-medium text-light-3 truncate">
                              {activity.location}
                            </span>
                          </div>
                        )}
                        
                        {activity.activityDate && (
                          <div className="flex items-center gap-2">
                            <img
                              src="/assets/icons/posts.svg"
                              alt="date"
                              width={14}
                              height={14}
                              className="opacity-70"
                            />
                            <span className="small-medium text-light-4">
                              {new Date(activity.activityDate).toLocaleDateString()}
                            </span>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Connecting line to next day (except for last day) */}
            {dayIndex < sortedDays.length - 1 && (
              <div className="flex items-center justify-center py-4">
                <div className="flex flex-col items-center gap-2">
                  <div className="w-8 h-8 bg-primary-500 rounded-full flex items-center justify-center">
                    <img
                      src="/assets/icons/wallpaper.svg"
                      alt="next"
                      width={16}
                      height={16}
                      className="rotate-90"
                    />
                  </div>
                  <span className="small-medium text-light-4">Next Day</span>
                </div>
              </div>
            )}
          </div>
        ))}

        {/* Journey Complete */}
        <div className="flex items-center justify-center pt-6">
          <div className="bg-green-600 rounded-full px-6 py-3 flex items-center gap-2">
            <img
              src="/assets/icons/liked.svg"
              alt="complete"
              width={20}
              height={20}
            />
            <span className="body-bold text-white">Journey Complete!</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default JournalFlowchart;
