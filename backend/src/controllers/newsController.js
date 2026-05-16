exports.getNewsAndTrends = async (req, res, next) => {
  try {
    // Fetch from FDA open API for food recalls
    const response = await fetch('https://api.fda.gov/food/enforcement.json?limit=15');
    if (!response.ok) {
      throw new Error(`FDA API responded with status ${response.status}`);
    }
    const data = await response.json();
    
    // Format the results to match our app's needs
    const trendsAndNews = data.results.map((item, index) => ({
      id: item.recall_number || index.toString(),
      title: `${item.status === 'Ongoing' ? 'Active Recall' : 'Recall'}: ${item.product_description.substring(0, 50)}...`,
      description: item.reason_for_recall,
      product: item.product_description,
      recallingFirm: item.recalling_firm,
      date: item.recall_initiation_date, // format YYYYMMDD
      type: 'recall',
      url: 'https://www.fda.gov/safety/recalls-market-withdrawals-safety-alerts',
      haloCommentary: `This product by ${item.recalling_firm} was recalled due to ${item.reason_for_recall}. If you have this product saved, we strongly advise checking your pantry and discarding it immediately.`
    }));

    // Add some mock trend data since FDA only gives recalls
    trendsAndNews.unshift({
      id: 'trend-1',
      title: 'New Study Links Certain Artificial Dyes to ADHD',
      description: 'A new peer-reviewed study suggests a strong correlation between Red 40 and Yellow 5 and hyperactivity in children.',
      type: 'trend',
      date: new Date().toISOString().split('T')[0].replace(/-/g, ''),
      url: '#',
      haloCommentary: 'Halo recommends checking your children\'s snacks for Red 40 and Yellow 5. Use the scanner to find dye-free alternatives.'
    });

    res.json({
      success: true,
      data: trendsAndNews
    });
  } catch (error) {
    next(error);
  }
};
