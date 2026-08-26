import React from "react";
import {
  ComposedChart, Bar, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
} from "recharts";

// Calibration: for each predicted-PD bucket, compare the model's average
// predicted default rate against the actual observed default rate. A
// well-calibrated model tracks the diagonal.
export default function CalibrationChart({ data }) {
  const chartData = (data || []).map((b) => ({
    bucket: b.bucket,
    "Avg predicted PD": Number((b.avg_predicted_pd * 100).toFixed(1)),
    "Actual default rate": Number((b.actual_default_rate * 100).toFixed(1)),
    count: b.count,
  }));

  return (
    <div className="w-full h-72">
      <ResponsiveContainer width="100%" height="100%">
        <ComposedChart data={chartData} margin={{ top: 10, right: 16, bottom: 4, left: -8 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#eceef1" vertical={false} />
          <XAxis dataKey="bucket" tick={{ fontSize: 11, fill: "#525965" }} stroke="#eceef1" />
          <YAxis tick={{ fontSize: 11, fill: "#525965" }} stroke="#eceef1" unit="%" />
          <Tooltip
            contentStyle={{ fontSize: 12, borderRadius: 8, border: "1px solid #eceef1" }}
            formatter={(v) => [`${v}%`, undefined]}
          />
          <Legend wrapperStyle={{ fontSize: 12 }} />
          <Bar dataKey="count" name="Applications" fill="#e6f7f3" stroke="#99e6d8" radius={[4, 4, 0, 0]} yAxisId={0} />
          <Line dataKey="Avg predicted PD" stroke="#0d9488" strokeWidth={2} dot={{ r: 3 }} />
          <Line dataKey="Actual default rate" stroke="#dc2626" strokeWidth={2} dot={{ r: 3 }} strokeDasharray="5 4" />
        </ComposedChart>
      </ResponsiveContainer>
    </div>
  );
}